const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { catalogController } = require('./catalog.controller');

const catalogRouter = express.Router();

catalogRouter.post('/products', asyncHandler(catalogController.createProduct));
catalogRouter.get('/products', asyncHandler(catalogController.listProducts));
catalogRouter.get('/products/:productId', asyncHandler(catalogController.getProduct));

catalogRouter.post('/products/:productId/reviews', asyncHandler(catalogController.addReview));

catalogRouter.patch('/products/:productId/variants/:sku/stock', asyncHandler(catalogController.updateStockBySku));

catalogRouter.get('/analytics/top-rated', asyncHandler(catalogController.getTopRated));

module.exports = { catalogRouter };
