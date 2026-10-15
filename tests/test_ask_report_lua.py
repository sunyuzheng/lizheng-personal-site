"""Run the actual report-counting script (shared/ask-report.ts) against an isolated fakeredis+Lua
instance: each network's daily cap first, then everyone's, both keys expiring in two days.
Synthetic keys only; no credentials or network. Requires pytest and fakeredis[lua].
"""
import re
from pathlib import Path
import fakeredis
import pytest

SOURCE = (Path(__file__).resolve().parents[1] / 'shared/ask-report.ts').read_text()
SCRIPT = re.search(r'export const REPORT_COUNT_SCRIPT = `(.*?)`;', SOURCE, re.S).group(1)
NET_CAP = int(re.search(r'REPORT_NETWORK_DAILY_LIMIT = (\d+);', SOURCE).group(1))
DAY_CAP = int(re.search(r'REPORT_DAILY_LIMIT = (\d+);', SOURCE).group(1))
P = 'ask:report:v1:'


@pytest.fixture
def r():
    return fakeredis.FakeRedis(decode_responses=True)


def send(r, net='n1', day='2026-10-15'):
    return r.eval(SCRIPT, 2, f'{P}net:{net}:{day}', f'{P}day:{day}', NET_CAP, DAY_CAP, 172800)


def test_a_network_sends_its_daily_share_then_is_told_to_wait(r):
    assert [send(r) for _ in range(NET_CAP)] == [0] * NET_CAP
    assert send(r) == 1
    # A refused report does not use up everyone's allowance.
    assert r.get(f'{P}day:2026-10-15') == str(NET_CAP)
    assert 0 < r.ttl(f'{P}net:n1:2026-10-15') <= 172800 and 0 < r.ttl(f'{P}day:2026-10-15') <= 172800


def test_everyone_together_stops_at_the_daily_mail_cap(r):
    results = [send(r, net=f'n{i}') for i in range(DAY_CAP + 3)]
    assert results[:DAY_CAP] == [0] * DAY_CAP and results[DAY_CAP:] == [2] * 3
    assert send(r, net='n0', day='2026-10-16') == 0
