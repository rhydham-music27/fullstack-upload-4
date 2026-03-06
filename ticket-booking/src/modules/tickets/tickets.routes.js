const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ticketsController } = require('./tickets.controller');

const ticketsRouter = express.Router();

ticketsRouter.post('/events/:eventId/seats/init', asyncHandler(ticketsController.initSeats));

ticketsRouter.get('/events/:eventId/seats', asyncHandler(ticketsController.listSeats));

ticketsRouter.post('/events/:eventId/seats/:seatId/lock', asyncHandler(ticketsController.lockSeat));
ticketsRouter.post('/events/:eventId/seats/:seatId/confirm', asyncHandler(ticketsController.confirmSeat));
ticketsRouter.post('/events/:eventId/seats/:seatId/cancel', asyncHandler(ticketsController.cancelSeat));

ticketsRouter.post('/events/:eventId/seats/:seatId/unlock', asyncHandler(ticketsController.unlockSeat));

module.exports = { ticketsRouter };
