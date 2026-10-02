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
def start(r, n=1, visitor=V, conversation=C, day=D, score=1790870400000, digest=None):
    i = rid(n)
    keys = [P+'record:'+i, P+'deleted:'+i, P+'records', P+'conversation:'+conversation,
        P+'sequence:'+conversation, P+'total', P+'day:'+day, P+'visitors', P+'day-visitors:'+day,
        P+'conversations', P+'day-conversations:'+day]
    args = [digest or 'synthetic'+i, i, '合成提问😀', '2026-10-01T16:00:00.000Z', 'deepseek-v4-flash',
        visitor, conversation, 'understand', 'home', 5, day, score]
    return r.eval(SCRIPTS['OPS_START_SCRIPT'], len(keys), *keys, *args)

def finish(r,n=1,status='answered',duration=1200):
    return r.eval(SCRIPTS['OPS_FINISH_SCRIPT'],2,P+'record:'+rid(n),P+'total',status,duration,P,json.dumps({'status':status,'summary':'合成回答'}),'')
def delete(r,n=1):
    return r.eval(SCRIPTS['OPS_DELETE_SCRIPT'],3,P+'record:'+rid(n),P+'records',P+'total',rid(n),P)
def page(r,max_score=9999999999999,prev='',limit=26):
    return r.eval(SCRIPTS['OPS_PAGE_SCRIPT'],1,P+'records',max_score,0,prev,limit)

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

@pytest.mark.parametrize('status',['answered','clarify','unsupported','sources-only','error','cancelled','generating'])
def test_delete_updates_all_counters_and_blocks_delayed_retry(r,status):
    start(r)
    if status!='generating': finish(r,status=status,duration=31)
    assert delete(r)==1
    assert delete(r)==0
    assert not r.exists(P+'record:'+rid(1))
    assert r.zcard(P+'records')==0
    assert r.zcard(P+'conversation:'+C)==0
    assert not r.exists(P+'sequence:'+C)
    assert r.hlen(P+'visitors')==0
    assert r.hlen(P+'conversations')==0
    assert r.hlen(P+'day-visitors:'+D)==0
    assert r.hlen(P+'day-conversations:'+D)==0
    assert all(int(value)==0 for value in r.hgetall(P+'total').values())
    assert all(int(value)==0 for value in r.hgetall(P+'day:'+D).values())
    assert start(r)==2
    assert finish(r)==0
    assert not r.exists(P+'record:'+rid(1))

def test_delete_only_one_turn_keeps_other_counts_and_ordinal(r):
    start(r,1); start(r,2); finish(r,1); finish(r,2,status='error',duration=500)
    delete(r,1)
    assert r.hlen(P+'visitors')==1
    assert r.hlen(P+'conversations')==1
    assert r.hget(P+'total','questions')=='1'
    assert r.hget(P+'total','duration_ms')=='500'
    start(r,3)
    assert r.hget(P+'record:'+rid(3),'turn_number')=='3'

def test_range_unique_not_sum_of_daily_visitors(r):
    start(r,1); start(r,2,day='2026-10-03'); start(r,3,visitor='d'*64,conversation='e'*64,day='2026-10-03')
    keys=[P+'day-visitors:'+d for d in [D,'2026-10-03']]
    conv=[P+'day-conversations:'+d for d in [D,'2026-10-03']]
    ordered=[v for pair in zip(keys,conv) for v in pair]
    assert r.eval(SCRIPTS['OPS_UNIQUE_SCRIPT'],4,*ordered)==[2,2]
    delete(r,2)
    assert r.eval(SCRIPTS['OPS_UNIQUE_SCRIPT'],4,*ordered)==[2,2]

def test_seek_pages_same_timestamp_deleted_cursor_and_newer_insertions(r):
    for n in range(1, 640): start(r,n)
    seen=[]; score=9999999999999; prev=''
    while True:
        rows=page(r,score,prev,26)
        if not rows: break
        selected=list(zip(rows[::2], rows[1::2]))[:25]
        seen.extend(i for i,_ in selected)
        prev,score=selected[-1]; score=int(score)
        # Delete the cursor itself; seeking must still work.
        delete(r,UUID(prev).int)
        if len(rows)<=50: break
    assert len(seen)==639 and len(set(seen))==639
    assert seen[0]==rid(639) and seen[-1]==rid(1)

def test_seek_does_not_shift_after_new_question(r):
    for n in range(1,31): start(r,n,score=1790870400000+n)
    first=page(r,limit=26); prev,score=first[48:50]
    start(r,50,score=1790870400050)
    second=page(r,int(score),prev,26)
    assert second[::2]==[rid(n) for n in range(5,0,-1)]


SUMMARY_COUNTERS = ['questions', 'question_chars', 'generating', 'answered', 'clarify',
    'unsupported', 'sources-only', 'error', 'cancelled', 'completed', 'duration_ms', 'home', 'standalone']

def summary(r, days, all_time=False):
    keys = [P+'total', P+'visitors', P+'conversations']
    for day in days:
        keys.extend([P+'day:'+day, P+'day-visitors:'+day, P+'day-conversations:'+day])
    total, daily, unique = r.eval(SCRIPTS['OPS_SUMMARY_SCRIPT'], len(keys), *keys,
        'all' if all_time else 'range', *SUMMARY_COUNTERS)
    normalized = lambda row: dict(zip(SUMMARY_COUNTERS, [int(v or 0) for v in row]))
    return normalized(total), [normalized(row) for row in daily], unique

def test_summary_one_snapshot_deduplicates_range_and_excludes_older_days(r):
    start(r,1); finish(r,1,duration=1200)
    start(r,2,day='2026-10-03'); finish(r,2,status='cancelled',duration=500)
    start(r,3,visitor='d'*64,conversation='e'*64,day='2026-10-03')
    start(r,4,visitor='f'*64,conversation='1'*64,day='2026-08-01')
    total, daily, unique = summary(r,[D,'2026-10-03'])
    assert total['questions']==3 and total['question_chars']==15
    assert total['answered']==1 and total['cancelled']==1 and total['generating']==1
    assert total['completed']==2 and total['duration_ms']==1700
    assert [row['questions'] for row in daily]==[1,2] and unique==[2,2]

def test_summary_all_time_global_total_not_recent_chart_sum(r):
    start(r,1,day='2026-08-01'); finish(r,1,status='error',duration=77)
    start(r,2); finish(r,2,duration=12)
    start(r,3,visitor='d'*64,conversation='e'*64)
    total, daily, unique = summary(r,[D,'2026-10-03'],all_time=True)
    assert total['questions']==3 and total['completed']==2 and total['duration_ms']==89
    assert total['error']==1 and total['answered']==1 and total['generating']==1
    assert sum(row['questions'] for row in daily)==2 and unique==[2,2]
    assert daily[1]['questions']==0

def test_summary_deletion_updates_counts_and_unique_in_same_snapshot(r):
    start(r,1); start(r,2,visitor='d'*64,conversation='e'*64)
    finish(r,1,duration=31); finish(r,2,status='error',duration=12)
    delete(r,1)
    total, daily, unique = summary(r,[D])
    assert total['questions']==1 and total['answered']==0 and total['error']==1
    assert total['question_chars']==5 and total['duration_ms']==12 and unique==[1,1]
    assert daily[0]==total
    delete(r,2)
    total, daily, unique = summary(r,[D],all_time=True)
    assert all(v==0 for v in total.values()) and daily[0]==total and unique==[0,0]

def test_summary_ninety_empty_days_preserves_zero_fields(r):
    from datetime import date, timedelta
    days = [(date(2026,7,5)+timedelta(days=n)).isoformat() for n in range(90)]
    total, daily, unique = summary(r,days)
    assert len(daily)==90 and unique==[0,0]
    assert all(v==0 for v in total.values())
    assert all(row==total for row in daily)
