import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import Stripe from "stripe";
import Coupon from "../models/coupon.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);

router.post("/checkout-success", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.body;

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // 2. If coupon was used, deactivate it
      if (session.metadata?.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false },
        );
      }

      // 3. Send success response
      return res.status(200).json({
        success: true,
        message: "Payment successful",
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment not completed",
    });
  } catch (error) {
    console.error("Checkout success error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
