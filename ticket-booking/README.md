# Concurrent Ticket Booking + E-commerce Catalog (Single Express Server)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill:

- `MONGODB_URI`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

3. Run server:

```bash
npm run dev
```

Health check:

- `GET /health`

## Ticket Booking (Redis Seat Lock)

### Endpoints

- `POST /api/tickets/events/:eventId/seats/init` `{ "seatCount": 100 }`
- `GET /api/tickets/events/:eventId/seats`
- `POST /api/tickets/events/:eventId/seats/:seatId/lock` `{ "userId": "u1" }`
- `POST /api/tickets/events/:eventId/seats/:seatId/confirm` `{ "userId": "u1", "lockId": "..." }`
- `POST /api/tickets/events/:eventId/seats/:seatId/cancel` `{ "userId": "u1", "lockId": "..." }`

Notes:

- Lock uses Redis atomic `SET NX PX`.
- Confirm uses Lua to atomically validate ownership + book seat + delete lock.
- Lock auto-expires via TTL (`TICKET_LOCK_TTL_MS`).

## Catalog (MongoDB + Mongoose)

### Endpoints

- `POST /api/catalog/products`
- `GET /api/catalog/products`
- `GET /api/catalog/products/:productId`
- `POST /api/catalog/products/:productId/reviews`
- `PATCH /api/catalog/products/:productId/variants/:sku/stock` `{ "delta": -1 }`
- `GET /api/catalog/analytics/top-rated?limit=5`

### Example product payload

```json
{
  "name": "Premium Headphones",
  "category": "Electronics",
  "variants": [
    { "sku": "HP-BL-001", "color": "Black", "price": 199.99, "stock": 15 },
    { "sku": "HP-WH-001", "color": "White", "price": 209.99, "stock": 8 }
  ],
  "reviews": [
    {
      "userId": "65f4a8b7c1e6a8c1f4b8c7d1",
      "rating": 5,
      "comment": "Excellent sound quality"
    }
  ]
}
```

## Load testing (Artillery)

Install Artillery globally or as dev dependency:

```bash
npm i -g artillery
```

Run:

```bash
artillery run artillery/ticket-lock.yml
```
