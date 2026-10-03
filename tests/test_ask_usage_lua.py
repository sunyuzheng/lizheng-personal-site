"""Run the actual usage-counting script (shared/ask-usage.ts) against an isolated fakeredis+Lua
instance. Synthetic browsers only; no credentials or network. Requires pytest and fakeredis[lua].
"""
import re
from pathlib import Path
import fakeredis
import pytest

SOURCE = (Path(__file__).resolve().parents[1] / 'shared/ask-usage.ts').read_text()
SCRIPT = re.search(r'export const USAGE_RECORD_SCRIPT = `(.*?)`;', SOURCE, re.S).group(1)
P = 'ask-ops:{v3}:usage:'
TTL = 400 * 86400
DAY = 20730
DISTINCT = 'h_seen,d_seen,d_open,ask,answer'


@pytest.fixture
def r():
    return fakeredis.FakeRedis(decode_responses=True)


def send(r, browser='b1', surface='ask', view=1, engaged=0, marks=(), day=DAY, first=None, net='n1', cap=600):
    return r.eval(SCRIPT, 1, f'{P}net:{net}:{day}', P, day, first or day, surface, view, engaged,
                  browser, TTL, cap, DISTINCT, *marks)


def test_a_view_counts_once_with_its_surface_and_all(r):
    assert send(r, marks=('t10', 'd_shown')) == 1
    assert send(r, view=0, engaged=12000, marks=('t30', 'd_seen')) == 1
    day = r.hgetall(f'{P}day:{DAY}')
    assert day['ask:views'] == '1' and day['all:views'] == '1'
    assert day['ask:engaged_ms'] == '12000' and day['all:engaged_ms'] == '12000'
    assert day['ask:t10'] == '1' and day['ask:t30'] == '1' and day['all:d_seen'] == '1'
    assert r.hgetall(f'{P}total') == day
    assert r.get(f'{P}since') == str(DAY)


def test_distinct_browsers_by_day_surface_and_mark(r):
    send(r, 'b1', 'ask', marks=('d_seen', 'd_open'))
    send(r, 'b1', 'home', marks=('h_seen', 'd_seen'))
    send(r, 'b2', 'app', marks=('ask', 'answer', 'source'))
    assert r.pfcount(f'{P}visitors:{DAY}') == 2
    assert r.pfcount(f'{P}visitors:{DAY}:ask') == 1 and r.pfcount(f'{P}visitors:{DAY}:app') == 1
    assert r.pfcount(f'{P}mark:{DAY}:d_seen') == 1
    assert r.pfcount(f'{P}mark:{DAY}:ask') == 1
    # Counted, but not as distinct browsers.
    assert not r.exists(f'{P}mark:{DAY}:source')
    assert r.pfcount(f'{P}all-visitors') == 2 and r.pfcount(f'{P}all-mark:d_seen') == 1
    assert r.ttl(f'{P}visitors:{DAY}') == TTL and r.ttl(f'{P}day:{DAY}') == TTL
    assert r.ttl(f'{P}all-visitors') == -1 and r.ttl(f'{P}total') == -1


def test_cohorts_follow_the_first_day_for_thirty_days(r):
    send(r, 'b1', day=DAY)
    send(r, 'b1', day=DAY + 1, first=DAY)
    send(r, 'b2', day=DAY + 1)
    send(r, 'b1', day=DAY + 31, first=DAY)
    assert r.pfcount(f'{P}cohort:{DAY}:0') == 1
    assert r.pfcount(f'{P}cohort:{DAY}:1') == 1
    assert r.pfcount(f'{P}cohort:{DAY + 1}:0') == 1
    assert not r.exists(f'{P}cohort:{DAY}:31')
    # The first day stays the first day counted.
    assert r.get(f'{P}since') == str(DAY)


def test_a_network_is_capped_per_day(r):
    for _ in range(3):
        assert send(r, cap=3) == 1
    assert send(r, cap=3) == 0
    assert r.hget(f'{P}day:{DAY}', 'all:views') == '3'
    assert r.ttl(f'{P}net:n1:{DAY}') == 172800
    assert send(r, net='n2', cap=3) == 1
