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
SCRIPTS = {name: text for name, text in re.findall(r'export const (OPS_\w+_SCRIPT) = `(.*?)`;', SOURCE, re.S)}
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

def finish(r,n=1,status='answered',duration=1200):
    return r.eval(SCRIPTS['OPS_FINISH_SCRIPT'],2,P+'record:'+rid(n),P+'total',status,duration,P,json.dumps({'status':status,'summary':'合成回答'}),'')
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
    assert finish(r)==0
    start(r)
    assert finish(r)==1
    assert finish(r,status='error',duration=999)==0
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
