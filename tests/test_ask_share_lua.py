"""Run the actual share scripts (shared/ask-share-link.ts) against an isolated fakeredis+Lua
instance, next to the real record writer (ask-ops-storage.ts) and quota script (ask-quota-script.ts)
they work with. Synthetic records only; no credentials or network. Requires pytest and fakeredis[lua].
"""
import json
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID
import fakeredis
import pytest

ROOT = Path(__file__).resolve().parents[1]
# Template literals: \\ in the TypeScript source is one backslash in the script Redis runs.
def scripts(name):
    text = (ROOT / 'shared' / name).read_text()
    return {key: body.replace('\\\\', '\\') for key, body in re.findall(r'export const ([A-Z_]+_SCRIPT) = (?:String\.raw)?`(.*?)`;', text, re.S)}
SHARE = scripts('ask-share-link.ts')
OPS = scripts('ask-ops-storage.ts')
QUOTA = re.search(r'QUOTA_SCRIPT = String\.raw`(.*?)`;', (ROOT / 'shared/ask-quota-script.ts').read_text(), re.S).group(1)
P = 'ask-ops:{v3}:'
U = P + 'usage:'
D = '2026-10-04'
SHARES = P + 'shares'
BODY = '合成的回答段落，用来测试分享页。' * 16


@pytest.fixture
def r():
    return fakeredis.FakeRedis(decode_responses=True)


def rid(n): return str(UUID(int=n))


def record(r, n=1, day=D, notice=('v4', '0', ''), status='answered', intent='understand', question='一个合成的问题？', body=BODY):
    """A record as the site's writer stores it: start, then finish."""
    i = rid(n)
    keys = [P+'record:'+i, P+'deleted:'+i, P+'records', P+'conversation:'+'c'*64, P+'sequence:'+'c'*64, P+'total',
            P+'day:'+day, P+'visitors', P+'day-visitors:'+day, P+'conversations', P+'day-conversations:'+day]
    assert r.eval(OPS['OPS_START_SCRIPT'], len(keys), *keys, 'synthetic'+i, i, question, day+'T02:00:00.000Z',
                  'deepseek-v4-flash', 'a'*64, 'c'*64, intent, 'standalone', len(question), day, 1, *notice) == 1
    answer = {'status': status, 'summary': '合成摘要[S1]。', 'sections': [{'heading': '合成小标题', 'body': body, 'source_ids': ['S1'], 'kind': 'synthesis'}],
              'sources': [{'id': 'S1', 'title': '合成出处', 'url': 'https://example.test/a'}], 'followups': [], 'clarifying_questions': [], 'limitations': ''}
    if status != 'generating':
        assert r.eval(OPS['OPS_FINISH_SCRIPT'], 2, P+'record:'+i, P+'total', status, 1200, P, json.dumps(answer, ensure_ascii=False), '') == 1
    return i


def share(r, n=1, word='career-choice', count=1, surface='ask', at=1000):
    i = rid(n)
    return r.eval(SHARE['SHARE_SCRIPT'], 3, P+'record:'+i, P+'deleted:'+i, SHARES, P, i, word, '2026-10-04T03:00:00.000Z',
                  count, surface, U+'day:20730', U+'total', 400*86400, at)


def page(r, slug='career-choice', day=D, count=1):
    return r.eval(SHARE['SHARE_PAGE_SCRIPT'], 1, P+'share:'+day+':'+slug, P, day, slug, count, U+'day:20730', U+'total', 400*86400)


def test_a_share_takes_its_question_day_and_word_once(r):
    record(r)
    assert share(r) == ['NEW', 'career-choice', D]
    assert share(r, word='other-word') == ['SHARED', 'career-choice', D]
    assert r.get(P+'share:'+D+':career-choice') == rid(1)
    assert r.hget(P+'record:'+rid(1), 'share_slug') == 'career-choice'
    assert r.zscore(SHARES, rid(1)) == 1000
    # Counted once, by where it was shared and in all.
    assert r.hget(U+'day:20730', 'ask:share') == '1' and r.hget(U+'total', 'all:share') == '1'
    assert r.ttl(U+'day:20730') == 400*86400


def test_the_same_word_on_one_day_numbers_on(r):
    for n in range(1, 4):
        record(r, n)
    record(r, 4, day='2026-10-05')
    assert [share(r, n)[1] for n in range(1, 4)] == ['career-choice', 'career-choice-2', 'career-choice-3']
    assert share(r, 4) == ['NEW', 'career-choice', '2026-10-05']


@pytest.mark.parametrize('setup', ['v3', 'generating', 'clarify', 'deleted', 'missing'])
def test_only_an_answered_v4_record_that_still_exists_can_be_shared(r, setup):
    if setup == 'v3': record(r, notice=('v3', '', ''))
    elif setup in ('generating', 'clarify'): record(r, status=setup)
    elif setup == 'deleted':
        record(r)
        r.set(P+'deleted:'+rid(1), '1')
    code = share(r)[0]
    assert code == ('GONE' if setup in ('deleted', 'missing') else 'UNSHAREABLE')
    assert not r.keys(P+'share:*') and not r.exists(SHARES) and not r.exists(U+'total')


def test_the_page_reads_the_live_record_under_its_own_day_and_word(r):
    record(r, intent='apply', notice=('v4', '1', '目前的情况：合成处境'))
    share(r)
    ok = page(r)
    assert ok[0] == 'OK' and ok[1] == '一个合成的问题？' and json.loads(ok[2])['status'] == 'answered'
    assert ok[3:] == ['apply', D+'T02:00:00.000Z']
    # A record from before 2026-10-04 may still hold a situation: it never leaves storage.
    assert '合成处境' not in json.dumps(ok, ensure_ascii=False)
    assert r.hget(U+'total', 'all:share_view') == '1'
    assert page(r, count=0)[0] == 'OK' and r.hget(U+'total', 'all:share_view') == '1'
    assert page(r, day='2026-10-05') == ['MISSING'] and page(r, slug='career-choice-2') == ['MISSING']


def test_sharing_again_keeps_the_address(r):
    record(r); record(r, 2)
    assert share(r) == ['NEW', 'career-choice', D]
    assert share(r, word='other') == ['SHARED', 'career-choice', D]
    assert share(r, 2)[1] == 'career-choice-2'
    assert r.hget(U+'total', 'all:share') == '2'


def test_a_record_deleted_in_ops_takes_its_page_with_it(r):
    record(r)
    share(r)
    # Ops' delete removes the record and leaves a tombstone; the address stays reserved.
    r.delete(P+'record:'+rid(1))
    r.set(P+'deleted:'+rid(1), '1', ex=86400)
    assert page(r) == ['MISSING']
    r.delete(P+'deleted:'+rid(1))
    assert page(r) == ['MISSING']
    assert r.get(P+'share:'+D+':career-choice') == rid(1)


def test_the_sitemap_list_keeps_live_shares_newest_first(r):
    for n in range(1, 4):
        record(r, n)
    record(r, 4, notice=('v3', '', ''))
    for n, at in ((1, 10), (2, 20), (3, 30)):
        share(r, n, word=f'word{n}', at=at)
    r.zadd(SHARES, {rid(4): 40})  # never shareable; listed by mistake, it is skipped
    r.delete(P+'record:'+rid(3))
    rows = r.eval(SHARE['SHARE_LIST_SCRIPT'], 1, SHARES, P, 1000)
    assert rows == [[D, 'word2', '2026-10-04T03:00:00.000Z'], [D, 'word1', '2026-10-04T03:00:00.000Z']]
    # The deleted record leaves the list.
    assert r.zrange(SHARES, 0, -1) == [rid(1), rid(2), rid(4)]


# The quota script sets real expiry times, so these use today's clock, as Builder does.
NOW = int(time.time())
TODAY = datetime.fromtimestamp(NOW, timezone(timedelta(hours=8))).date().isoformat()
RESET = int(datetime.fromisoformat(TODAY + 'T00:00:00+08:00').timestamp()) + 86400


def quota(r, action, attempt, grant, now=NOW, lim=3, subject='a'*64):
    prefix = 'ask-quota:v1:{' + subject + '}:'
    return r.eval(QUOTA, 3, prefix+TODAY+':used', prefix+TODAY+':pending', prefix+'attempt:'+attempt, action, now, lim,
                  attempt, grant, TODAY, RESET, 150, 172800)


def bonus(r, now=NOW, subject='a'*64):
    prefix = 'ask-quota:v1:{' + subject + '}:' + TODAY + ':'
    return r.eval(SHARE['SHARE_BONUS_SCRIPT'], 3, prefix+'used', prefix+'pending', prefix+'share-bonus', now, RESET + 172800)


def test_a_share_gives_back_one_used_question_once_a_day(r):
    # Nothing used yet: nothing to give back, and the day's bonus is still open.
    assert bonus(r) == ['UNUSED', 0, 0]
    assert not r.exists('ask-quota:v1:{'+'a'*64+'}:'+TODAY+':share-bonus')
    for n in range(3):
        a = rid(100 + n)
        assert quota(r, 'reserve', a, 'g'+a)[0] == 'OK'
        assert quota(r, 'commit', a, 'g'+a)[0] == 'OK'
    assert quota(r, 'reserve', rid(200), 'g')[0] == 'EXHAUSTED'
    assert bonus(r) == ['GRANTED', 2, 0]
    assert bonus(r) == ['CLAIMED', 2, 0]
    assert 0 < r.ttl('ask-quota:v1:{'+'a'*64+'}:'+TODAY+':share-bonus') <= RESET + 172800 - NOW
    # The given-back question can be asked; then the day is full again.
    assert quota(r, 'reserve', rid(201), 'g201')[0] == 'OK'
    assert quota(r, 'commit', rid(201), 'g201') == ['OK', 3, 0]
    assert quota(r, 'reserve', rid(202), 'g202')[0] == 'EXHAUSTED'


def test_a_question_in_progress_counts_against_what_is_left(r):
    a = rid(100)
    quota(r, 'reserve', a, 'g'); quota(r, 'commit', a, 'g')
    quota(r, 'reserve', rid(101), 'h')
    assert bonus(r) == ['GRANTED', 0, 1]
    # A lease that ran out is not in progress.
    assert bonus(r, now=NOW + 151) == ['CLAIMED', 0, 0]


def test_counts_add_one_to_each_field(r):
    assert r.eval(SHARE['SHARE_COUNT_SCRIPT'], 2, U+'day:20730', U+'total', 400*86400, 'home:share_bonus', 'all:share_bonus') == 1
    assert r.hgetall(U+'total') == {'home:share_bonus': '1', 'all:share_bonus': '1'}
    assert r.ttl(U+'day:20730') == 400*86400 and r.ttl(U+'total') == -1
