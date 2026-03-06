const { getRedis } = require('../../config/redis');

const redis = getRedis();

const locksRepo = {
  async acquireLock({ lockKey, lockValue, ttlMs }) {
    const res = await redis.set(lockKey, lockValue, {
      nx: true,
      px: ttlMs
    });

    return res === 'OK';
  },

  async releaseLock({ lockKey, expected }) {
    const lua = `
      local lockKey = KEYS[1]
      local expected = ARGV[1]

      local current = redis.call('GET', lockKey)
      if (current == false) then
        return 0
      end
      if (current ~= expected) then
        return 0
      end

      redis.call('DEL', lockKey)
      return 1
    `;

    const result = await redis.eval(lua, [lockKey], [expected]);
    return result === 1;
  }
};

module.exports = { locksRepo };
