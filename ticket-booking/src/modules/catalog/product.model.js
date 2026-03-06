const mongoose = require('mongoose');

const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    color: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
  },
  { timestamps: true, _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    variants: { type: [VariantSchema], default: [] },
    reviews: { type: [ReviewSchema], default: [] },
    avgRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, name: 1 });
ProductSchema.index({ 'variants.sku': 1 });

ProductSchema.methods.recomputeAvgRating = async function recomputeAvgRating() {
  const list = Array.isArray(this.reviews) ? this.reviews : [];

  if (list.length === 0) {
    this.avgRating = 0;
    return;
  }

  const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  this.avgRating = Number((sum / list.length).toFixed(2));
};

ProductSchema.statics.updateVariantStock = async function updateVariantStock({ productId, sku, delta }) {
  if (!Number.isInteger(delta) || delta === 0) return null;

  const filter = {
    _id: productId,
    variants: {
      $elemMatch: {
        sku,
        ...(delta < 0 ? { stock: { $gte: Math.abs(delta) } } : {})
      }
    }
  };

  const update = { $inc: { 'variants.$.stock': delta } };

  const res = await this.updateOne(filter, update);
  if (res.modifiedCount === 0) return null;

  return true;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = { Product };
