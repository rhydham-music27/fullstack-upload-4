const mongoose = require('mongoose');
const { httpError } = require('../../utils/httpError');
const { Product } = require('./product.model');

function parseIntSafe(x, fallback) {
  const n = Number(x);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

const catalogService = {
  async createProduct(input) {
    const { name, category, variants, reviews } = input || {};

    if (!name || !category) {
      throw httpError(400, 'name and category are required');
    }

    const product = await Product.create({
      name,
      category,
      variants: Array.isArray(variants) ? variants : [],
      reviews: Array.isArray(reviews) ? reviews : []
    });

    await product.recomputeAvgRating();
    return product;
  },

  async listProducts() {
    return Product.find().sort({ createdAt: -1 });
  },

  async getProduct({ productId }) {
    if (!mongoose.isValidObjectId(productId)) throw httpError(400, 'Invalid productId');

    const product = await Product.findById(productId);
    if (!product) throw httpError(404, 'Product not found');

    return product;
  },

  async addReview({ productId, review }) {
    if (!mongoose.isValidObjectId(productId)) throw httpError(400, 'Invalid productId');

    const { userId, rating, comment } = review || {};

    if (!userId || rating == null) {
      throw httpError(400, 'userId and rating are required');
    }

    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      throw httpError(400, 'rating must be between 1 and 5');
    }

    const product = await Product.findById(productId);
    if (!product) throw httpError(404, 'Product not found');

    product.reviews.push({ userId, rating: r, comment });
    await product.recomputeAvgRating();
    await product.save();

    return product.reviews.at(-1);
  },

  async updateStockBySku({ productId, sku, delta }) {
    if (!mongoose.isValidObjectId(productId)) throw httpError(400, 'Invalid productId');
    if (!sku) throw httpError(400, 'sku is required');

    const d = parseIntSafe(delta, NaN);
    if (!Number.isInteger(d) || d === 0) throw httpError(400, 'delta must be a non-zero integer');

    const updated = await Product.updateVariantStock({ productId, sku, delta: d });
    if (!updated) throw httpError(404, 'Product/variant not found or insufficient stock');

    return { ok: true };
  },

  async getTopRated({ limit }) {
    const lim = Math.min(Math.max(parseIntSafe(limit, 5), 1), 50);

    const pipeline = [
      {
        $project: {
          name: 1,
          category: 1,
          avgRating: { $ifNull: ['$avgRating', 0] },
          reviewCount: { $size: { $ifNull: ['$reviews', []] } }
        }
      },
      { $sort: { avgRating: -1, reviewCount: -1 } },
      { $limit: lim }
    ];

    return Product.aggregate(pipeline);
  }
};

module.exports = { catalogService };
