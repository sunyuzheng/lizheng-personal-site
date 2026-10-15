"""Run the actual TypeScript Redis scripts against an isolated fakeredis+Lua instance.
No credentials or network. Requires pytest and fakeredis[lua].
"""
import json
import re
from pathlib import Path
from uuid import UUID
import fakeredis
import pytest

SOURCE = (Path(__file__).resolve().parents[1] / 'shared/ask-ops-storage.ts').read_text()
# Scripts that take a page's address include its Lua helper, as ${PAGE_ADDRESS_LUA}.
HELPERS = dict(re.findall(r'export const (\w+_LUA) = `(.*?)`;', SOURCE, re.S))
def resolve(text): return re.sub(r'\$\{(\w+)\}', lambda m: HELPERS[m.group(1)], text)
SCRIPTS = {name: resolve(text) for name, text in re.findall(r'export const (OPS_\w+_SCRIPT) = `(.*?)`;', SOURCE, re.S)}
P = 'ask-ops:{v3}:'
V, C, D = 'a'*64, 'b'*64, '2026-10-02'

@pytest.fixture
def r():
    return fakeredis.FakeRedis(decode_responses=True)

def rid(n): return str(UUID(int=n))
def start(r, n=1, visitor=V, conversation=C, day=D, score=1790870400000, digest=None, notice=('v3', '', '')):
    i = rid(n)
    keys = [P+'record:'+i, P+'deleted:'+i, P+'records', P+'conversation:'+conversation,
        P+'sequence:'+conversation, P+'total', P+'day:'+day, P+'visitors', P+'day-visitors:'+day,
        P+'conversations', P+'day-conversations:'+day]
    args = [digest or 'synthetic'+i, i, '合成提问😀', '2026-10-01T16:00:00.000Z', 'deepseek-v4-flash',
        visitor, conversation, 'understand', 'home', 5, day, score, *notice]
    return r.eval(SCRIPTS['OPS_START_SCRIPT'], len(keys), *keys, *args)

def finish(r,n=1,status='answered',duration=1200,word=None,at=1790870500000):
    args = [] if word is None else [word, rid(n), '2026-10-02T03:00:00.000Z', at]
    return r.eval(SCRIPTS['OPS_FINISH_SCRIPT'],2,P+'record:'+rid(n),P+'total',status,duration,P,json.dumps({'status':status,'summary':'合成回答'}),'',*args)
def test_intake_saved_without_ttl_and_retry_counts_once(r):
    assert start(r)==1
    assert start(r)==0
    assert r.ttl(P+'record:'+rid(1))==-1
    assert r.hget(P+'total','questions')=='1'
    assert r.hget(P+'record:'+rid(1),'question')=='合成提问😀'
    assert r.hget(P+'record:'+rid(1),'turn_number')=='1'
    assert start(r,digest='changed')==-1
    assert r.hget(P+'total','questions')=='1'

def test_multiple_turns_browser_and_conversation_counts(r):
    for n in range(1,4): assert start(r,n)==1
    start(r,4,conversation='c'*64)
    start(r,5,visitor='d'*64,conversation='e'*64)
    assert r.hlen(P+'visitors')==2
    assert r.hlen(P+'conversations')==3
    assert r.zcard(P+'conversation:'+C)==3
    assert r.hget(P+'record:'+rid(3),'turn_number')=='3'
    assert r.hget(P+'total','questions')=='5'

def test_finish_once_and_no_resurrection_without_start(r):
    assert finish(r)==[0,'','']
    start(r)
    assert finish(r)==[1,'',D]
    assert finish(r,status='error',duration=999)==[0,'',D]
    assert r.hget(P+'record:'+rid(1),'status')=='answered'
    assert r.hget(P+'total','answered')=='1'
    assert r.hget(P+'day:'+D,'duration_ms')=='1200'
    assert r.hget(P+'total','generating')=='0'
    assert json.loads(r.hget(P+'record:'+rid(1),'answer'))['summary']=='合成回答'
    assert r.ttl(P+'record:'+rid(1))==-1


def test_v4_intake_keeps_notice_background_and_situation(r):
    assert start(r, notice=('v4', '1', '合成处境')) == 1
    record = r.hgetall(P+'record:'+rid(1))
    assert (record['notice_version'], record['has_background'], record['context']) == ('v4', '1', '合成处境')
    assert start(r, n=2, notice=('v4', '0', '')) == 1
    assert r.hget(P+'record:'+rid(2), 'has_background') == '0'
    assert start(r, n=3) == 1
    assert (r.hget(P+'record:'+rid(3), 'notice_version'), r.hget(P+'record:'+rid(3), 'has_background')) == ('v3', '')


def v4(r, n=1, intent='understand', background='0', day=D, conversation=None):
    # Each question its own conversation, unless a test puts several in one.
    i, c = rid(n), conversation or '%064x' % n
    keys = [P+'record:'+i, P+'deleted:'+i, P+'records', P+'conversation:'+c, P+'sequence:'+c, P+'total',
        P+'day:'+day, P+'visitors', P+'day-visitors:'+day, P+'conversations', P+'day-conversations:'+day]
    args = ['synthetic'+i, i, '合成提问', '2026-10-01T16:00:00.000Z', 'deepseek-v4-flash', V, c, intent, 'home', 4, day,
        1790870400000+n, 'v4', background, '']
    assert r.eval(SCRIPTS['OPS_START_SCRIPT'], len(keys), *keys, *args) == 1


def test_an_answered_question_gets_its_page_when_it_is_archived(r):
    v4(r)
    assert finish(r, word='career-choice') == [1, 'career-choice', D]
    record = r.hgetall(P+'record:'+rid(1))
    assert (record['status'], record['share_slug'], record['shared_at']) == ('answered', 'career-choice', '2026-10-02T03:00:00.000Z')
    assert r.get(P+'share:'+D+':career-choice') == rid(1)
    assert r.zscore(P+'shares', rid(1)) == 1790870500000
    # A lost reply's retry finds the record finished and its page made, under the same address.
    assert finish(r, word='career-choice') == [0, 'career-choice', D]
    assert finish(r, word='another-word') == [0, 'career-choice', D]
    assert r.hget(P+'total', 'answered') == '1'


def test_the_same_word_on_one_day_numbers_on(r):
    v4(r, 1); v4(r, 2, background='1'); v4(r, 3, day='2026-10-03')
    assert [finish(r, n, word='career-choice')[1] for n in (1, 2, 3)] == ['career-choice', 'career-choice-2', 'career-choice']


def test_a_conversation_is_one_page_its_first_answered_question_s(r):
    # 2026-10-15, the owner: a conversation keeps one address, titled by its first question.
    v4(r, 1, conversation=C); v4(r, 2, conversation=C, background='1'); v4(r, 3, conversation=C, day='2026-10-03')
    assert finish(r, 1, word='career-choice') == [1, 'career-choice', D]
    assert r.get(P+'conversation-head:'+C) == rid(1)
    # Each follow-up is told the conversation's page, even asked on another day, and gets none of its own.
    assert finish(r, 2, word='other-word') == [1, 'career-choice', D]
    assert finish(r, 3, word='third-word') == [1, 'career-choice', D]
    assert not r.hget(P+'record:'+rid(2), 'share_slug') and not r.hget(P+'record:'+rid(3), 'share_slug')
    assert sorted(r.keys(P+'share:*')) == [P+'share:'+D+':career-choice']
    assert r.zrange(P+'shares', 0, -1) == [rid(1)]


def test_a_conversation_whose_first_question_had_no_answer_starts_at_its_first_answer(r):
    v4(r, 1, conversation=C); v4(r, 2, conversation=C); v4(r, 3, conversation=C)
    assert finish(r, 1, status='clarify', word='career-choice') == [1, '', D]
    assert not r.exists(P+'conversation-head:'+C)
    assert finish(r, 2, word='career-choice') == [1, 'career-choice', D]
    assert r.get(P+'conversation-head:'+C) == rid(2)
    assert finish(r, 3, word='career-choice') == [1, 'career-choice', D]
    assert r.hget(P+'record:'+rid(2), 'share_slug') == 'career-choice' and not r.hget(P+'record:'+rid(3), 'share_slug')


def test_a_follow_up_finds_the_page_of_a_first_question_from_before_pages_were_made(r):
    # Its first question was answered before 2026-10-14 and never shared: it gets the page now.
    v4(r, 1, conversation=C); v4(r, 2, conversation=C)
    finish(r, 1)
    assert not r.hget(P+'record:'+rid(1), 'share_slug')
    assert finish(r, 2, word='career-choice') == [1, 'career-choice', D]
    assert r.hget(P+'record:'+rid(1), 'share_slug') == 'career-choice' and r.get(P+'share:'+D+':career-choice') == rid(1)
    assert not r.hget(P+'record:'+rid(2), 'share_slug') and r.zrange(P+'shares', 0, -1) == [rid(1)]


def test_deleting_the_first_question_takes_the_conversation_s_page_for_good(r):
    v4(r, 1, conversation=C); v4(r, 2, conversation=C); v4(r, 3, conversation=C)
    finish(r, 1, word='career-choice'); finish(r, 2, word='career-choice')
    # Ops' delete removes the record from its conversation; the conversation keeps its first question.
    r.delete(P+'record:'+rid(1)); r.zrem(P+'conversation:'+C, rid(1))
    assert finish(r, 3, word='career-choice') == [1, '', '']
    assert r.get(P+'conversation-head:'+C) == rid(1)
    assert not r.hget(P+'record:'+rid(3), 'share_slug') and not r.hget(P+'record:'+rid(2), 'share_slug')


def test_a_conversation_from_before_finds_its_first_answered_question_when_first_needed(r):
    # Asked before 2026-10-15: no conversation-head kept, and a follow-up may hold its own page.
    v4(r, 1, conversation=C); v4(r, 2, conversation=C)
    finish(r, 1, status='error')
    r.hset(P+'record:'+rid(2), mapping={'status': 'answered', 'share_slug': 'own-word', 'answer': '{}'})
    v4(r, 3, conversation=C)
    assert finish(r, 3, word='career-choice') == [1, 'own-word', D]
    assert r.get(P+'conversation-head:'+C) == rid(2)


def test_a_question_about_the_asker_s_own_situation_gets_its_page_too(r):
    # 2026-10-15: every answered question is published, so every one has its page.
    v4(r, intent='apply', background='1')
    assert finish(r, word='career-choice') == [1, 'career-choice', D]
    assert r.hget(P+'record:'+rid(1), 'share_slug') == 'career-choice'


@pytest.mark.parametrize('case', ['v3', 'clarify', 'no word'])
def test_no_page_for_older_records_other_results_or_without_a_word(r, case):
    if case == 'v3': start(r)
    else: v4(r)
    status = 'clarify' if case == 'clarify' else 'answered'
    assert finish(r, status=status, word=None if case == 'no word' else 'career-choice') == [1, '', D]
    assert not r.hget(P+'record:'+rid(1), 'share_slug') and not r.keys(P+'share:*') and not r.exists(P+'shares')


def test_a_page_made_by_its_asker_first_is_kept(r):
    v4(r)
    r.hset(P+'record:'+rid(1), mapping={'share_slug': 'own-word', 'shared_at': 'earlier'})
    assert finish(r, word='career-choice') == [1, 'own-word', D]
    assert not r.exists(P+'share:'+D+':career-choice')
