import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true
    },
    image: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

categorySchema.plugin(mongooseAggregatePaginate);

export const Category = mongoose.model('Category', categorySchema);
