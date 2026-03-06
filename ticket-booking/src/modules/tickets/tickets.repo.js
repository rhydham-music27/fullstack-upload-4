const { getRedis } = require('../../config/redis');

const redis = getRedis();

const ticketsRepo = {
  async initSeats({ eventId, seatCount, seatKey }) {
    const pipeline = redis.pipeline();

    for (let i = 1; i <= seatCount; i += 1) {
      pipeline.set(seatKey(eventId, String(i)), 'available');
    }

    await pipeline.exec();
  },

  async listSeats({ eventId, seatKey }) {
    const pattern = seatKey(eventId, '*');
    const keys = await redis.keys(pattern);

    keys.sort((a, b) => {
      const aN = Number(a.split(':').at(-1));
      const bN = Number(b.split(':').at(-1));
      return aN - bN;
    });

    if (keys.length === 0) return [];

    const values = await redis.mget(keys);
    return keys.map((k, idx) => ({
      seatId: k.split(':').at(-1),
      status: values[idx]
    }));
  },

  async getSeatStatus({ key }) {
    return redis.get(key);
  },

  async confirmIfLocked({ seatKey, lockKey, expectedLockValue }) {
    const lua = `
      local seatKey = KEYS[1]
      local lockKey = KEYS[2]
      local expected = ARGV[1]

      local seatStatus = redis.call('GET', seatKey)
      if (seatStatus == false) then
        return 0
      end
      if (seatStatus == 'booked') then
        return 0
      end

      local lockVal = redis.call('GET', lockKey)
      if (lockVal == false) then
        return 0
      end
      if (lockVal ~= expected) then
        return 0
      end

      redis.call('SET', seatKey, 'booked')
      redis.call('DEL', lockKey)
      return 1
    `;

    const result = await redis.eval(lua, [seatKey, lockKey], [expectedLockValue]);
    return result === 1;
  }
};

module.exports = { ticketsRepo };
