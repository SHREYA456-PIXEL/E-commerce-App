import mongoose from "mongoose";
import { refreshToken } from "../controllers/auth.controller.js";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      Unique: true,
    },
    discountPercentage: {
      type: String,
      required: true,
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      uniqyue: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
