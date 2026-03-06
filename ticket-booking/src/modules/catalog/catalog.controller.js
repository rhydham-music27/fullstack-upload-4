const { catalogService } = require('./catalog.service');

const catalogController = {
  async createProduct(req, res) {
    const product = await catalogService.createProduct(req.body);
    res.status(201).json(product);
  },

  async listProducts(req, res) {
    const products = await catalogService.listProducts();
    res.json(products);
  },

  async getProduct(req, res) {
    const { productId } = req.params;
    const product = await catalogService.getProduct({ productId });
    res.json(product);
  },

  async addReview(req, res) {
    const { productId } = req.params;
    const review = await catalogService.addReview({ productId, review: req.body });
    res.status(201).json(review);
  },

  async updateStockBySku(req, res) {
    const { productId, sku } = req.params;
    const { delta } = req.body;

    const result = await catalogService.updateStockBySku({ productId, sku, delta });
    res.json(result);
  },

  async getTopRated(req, res) {
    const { limit } = req.query;
    const data = await catalogService.getTopRated({ limit });
    res.json(data);
  }
};

module.exports = { catalogController };
