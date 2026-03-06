const { nanoid } = require('nanoid');
const { httpError } = require('../../utils/httpError');
const { ticketsRepo } = require('./tickets.repo');
const { locksRepo } = require('./ticketsLocks.repo');

function seatKey(eventId, seatId) {
  return `tickets:event:${eventId}:seat:${seatId}`;
}

function lockKey(eventId, seatId) {
  return `tickets:event:${eventId}:seat:${seatId}:lock`;
}

const ticketsService = {
  async initSeats({ eventId, seatCount }) {
    const count = Number(seatCount);
    if (!Number.isInteger(count) || count <= 0 || count > 5000) {
      throw httpError(400, 'seatCount must be an integer between 1 and 5000');
    }

    await ticketsRepo.initSeats({ eventId, seatCount: count, seatKey });
    return { ok: true, eventId, seatCount: count };
  },

  async listSeats({ eventId }) {
    return ticketsRepo.listSeats({ eventId, seatKey });
  },

  async lockSeat({ eventId, seatId, userId }) {
    if (!userId) throw httpError(400, 'userId is required');

    const status = await ticketsRepo.getSeatStatus({ key: seatKey(eventId, seatId) });
    if (!status) throw httpError(404, 'Seat not found (init event seats first)');
    if (status === 'booked') throw httpError(409, 'Seat already booked');

    const lockId = nanoid();
    const ttlMs = Number(process.env.TICKET_LOCK_TTL_MS || 30000);

    const acquired = await locksRepo.acquireLock({
      lockKey: lockKey(eventId, seatId),
      lockValue: JSON.stringify({ lockId, userId }),
      ttlMs
    });

    if (!acquired) {
      throw httpError(409, 'Seat is currently locked by someone else');
    }

    return { ok: true, eventId, seatId, userId, lockId, ttlMs };
  },

  async unlockSeat({ eventId, seatId, userId, lockId }) {
    if (!userId || !lockId) throw httpError(400, 'userId and lockId are required');

    const released = await locksRepo.releaseLock({
      lockKey: lockKey(eventId, seatId),
      expected: JSON.stringify({ lockId, userId })
    });

    if (!released) throw httpError(409, 'Unlock failed (lock missing or not owned by you)');

    return { ok: true };
  },

  async confirmSeat({ eventId, seatId, userId, lockId }) {
    if (!userId || !lockId) throw httpError(400, 'userId and lockId are required');

    const seatK = seatKey(eventId, seatId);
    const lockK = lockKey(eventId, seatId);

    const confirmed = await ticketsRepo.confirmIfLocked({
      seatKey: seatK,
      lockKey: lockK,
      expectedLockValue: JSON.stringify({ lockId, userId })
    });

    if (!confirmed) {
      throw httpError(409, 'Confirm failed (seat booked, seat missing, lock expired, or lock not owned by you)');
    }

    return { ok: true, status: 'booked' };
  },

  async cancelSeat({ eventId, seatId, userId, lockId }) {
    if (!userId || !lockId) throw httpError(400, 'userId and lockId are required');

    const released = await locksRepo.releaseLock({
      lockKey: lockKey(eventId, seatId),
      expected: JSON.stringify({ lockId, userId })
    });

    if (!released) {
      throw httpError(409, 'Cancel failed (lock missing or not owned by you)');
    }

    return { ok: true, status: 'available' };
  }
};

module.exports = { ticketsService };
