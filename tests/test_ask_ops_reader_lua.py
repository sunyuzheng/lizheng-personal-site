"""Execute the fixed read-only Lua against local, synthetic fakeredis data."""
import re
from pathlib import Path

import fakeredis
import pytest

SOURCE = (Path(__file__).resolve().parents[1] / "shared/ask-ops-reader.ts").read_text()
SCRIPT = re.search(r"export const OPS_READ_SCRIPT = `\n(.*?)\n`;", SOURCE, re.S).group(1)
KEY = "ask-query:v1:01234567-89ab-4cde-8f01-23456789abcd"


def record(redis, key=KEY, ttl=3600, **values):
    redis.hset(key, mapping={"question": "synthetic 😀", "created_at": "2026-10-02T01:00:00.000Z",
                             "model": "deepseek-v4-flash", "status": "answered", "duration_ms": "1234", **values})
    if ttl is not None:
        redis.expire(key, ttl)


def test_fixed_fields_and_ttl_are_atomic_and_no_keys_are_changed():
    redis = fakeredis.FakeRedis(decode_responses=True)
    record(redis)
    before = redis.hgetall(KEY)
    ttl = redis.ttl(KEY)
    rows, invalid = redis.eval(SCRIPT, 1, KEY)
    assert rows == [[KEY, "synthetic 😀", "2026-10-02T01:00:00.000Z", "deepseek-v4-flash", "answered", "1234"]]
    assert invalid == 0
    assert redis.hgetall(KEY) == before
    assert redis.ttl(KEY) <= ttl


def test_missing_expired_records_skip_and_persistent_or_oversized_rows_are_marked():
    redis = fakeredis.FakeRedis(decode_responses=True)
    assert redis.eval(SCRIPT, 1, KEY) == [[], 0]
    record(redis, ttl=None)
    assert redis.eval(SCRIPT, 1, KEY) == [[], 1]
    record(redis, question="x" * 8001)
    assert redis.eval(SCRIPT, 1, KEY) == [[], 1]
    record(redis)
    redis.hdel(KEY, "question")
    assert redis.eval(SCRIPT, 1, KEY) == [[], 1]


@pytest.mark.parametrize("key", ["ask:auth:session:synthetic", KEY.upper(), KEY + ":extra", "ask-query:v2:synthetic"])
def test_namespace_and_uuid_are_validated_inside_lua(key):
    redis = fakeredis.FakeRedis(decode_responses=True)
    with pytest.raises(Exception, match="invalid_ops_read"):
        redis.eval(SCRIPT, 1, key)


def test_batch_is_bounded_to_100_and_unicode_question_bytes_fit_the_existing_schema():
    redis = fakeredis.FakeRedis(decode_responses=True)
    record(redis, question="😀" * 2000)
    assert len(redis.eval(SCRIPT, 1, KEY)[0][0][1]) == 2000
    with pytest.raises(Exception, match="invalid_ops_read"):
        redis.eval(SCRIPT, 101, *([KEY] * 101))
