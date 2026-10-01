/** Mirrors server.quota.SCRIPT in ask-lizheng; compare exact bytes before release. */
export const QUOTA_SCRIPT = String.raw`
local action, now, lim = ARGV[1], tonumber(ARGV[2]), tonumber(ARGV[3])
local attempt, grant, day = ARGV[4], ARGV[5], ARGV[6]
local reset, lease, retention = tonumber(ARGV[7]), tonumber(ARGV[8]), tonumber(ARGV[9])
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now)
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local pending = redis.call('ZCARD', KEYS[2])
local state = redis.call('HGET', KEYS[3], 'state')
local same = redis.call('HGET', KEYS[3], 'grant') == grant and redis.call('HGET', KEYS[3], 'day') == day
local code = 'OK'
if action == 'reserve' then
  if state then
    if not (state == 'pending' and same and tonumber(redis.call('HGET', KEYS[3], 'lease') or '0') > now) then code = 'DUPLICATE' end
  elseif lim > 0 and used + pending >= lim then code = 'EXHAUSTED'
  else
    redis.call('HSET', KEYS[3], 'state', 'pending', 'grant', grant, 'day', day, 'lease', now + lease)
    redis.call('EXPIRE', KEYS[3], retention)
    redis.call('ZADD', KEYS[2], now + lease, attempt)
  end
elseif action == 'commit' then
  if state == 'pending' and same and tonumber(redis.call('HGET', KEYS[3], 'lease') or '0') > now and redis.call('ZSCORE', KEYS[2], attempt) then
    redis.call('ZREM', KEYS[2], attempt)
    redis.call('INCR', KEYS[1])
    redis.call('HSET', KEYS[3], 'state', 'committed')
  elseif not (state == 'committed' and same) then code = 'EXPIRED' end
elseif action == 'release' then
  if state == 'pending' and same then
    redis.call('ZREM', KEYS[2], attempt)
    redis.call('HSET', KEYS[3], 'state', 'released')
  elseif not same then code = 'EXPIRED' end
elseif action ~= 'status' then return redis.error_reply('invalid operation') end
redis.call('EXPIREAT', KEYS[1], reset + retention)
redis.call('EXPIREAT', KEYS[2], reset + retention)
return {code, tonumber(redis.call('GET', KEYS[1]) or '0'), redis.call('ZCARD', KEYS[2])}
`;
