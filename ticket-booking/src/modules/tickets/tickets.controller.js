const { ticketsService } = require('./tickets.service');

const ticketsController = {
  async initSeats(req, res) {
    const { eventId } = req.params;
    const { seatCount } = req.body;

    const result = await ticketsService.initSeats({ eventId, seatCount });
    res.json(result);
  },

  async listSeats(req, res) {
    const { eventId } = req.params;
    const seats = await ticketsService.listSeats({ eventId });
    res.json(seats);
  },

  async lockSeat(req, res) {
    const { eventId, seatId } = req.params;
    const { userId } = req.body;

    const result = await ticketsService.lockSeat({ eventId, seatId, userId });
    res.json(result);
  },

  async unlockSeat(req, res) {
    const { eventId, seatId } = req.params;
    const { userId, lockId } = req.body;

    const result = await ticketsService.unlockSeat({ eventId, seatId, userId, lockId });
    res.json(result);
  },

  async confirmSeat(req, res) {
    const { eventId, seatId } = req.params;
    const { userId, lockId } = req.body;

    const result = await ticketsService.confirmSeat({ eventId, seatId, userId, lockId });
    res.json(result);
  },

  async cancelSeat(req, res) {
    const { eventId, seatId } = req.params;
    const { userId, lockId } = req.body;

    const result = await ticketsService.cancelSeat({ eventId, seatId, userId, lockId });
    res.json(result);
  }
};

module.exports = { ticketsController };
