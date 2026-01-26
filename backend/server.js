//const express = require("express");
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

//const PORT = 5000;
//console.log(process.env.PORT);

const PORT = process.env.PORT || 5000;

//authentication
app.use(express.json()); //allows u to parse the body of the request
app.use(cookieParser()); //to parse cookies

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);

  connectDB();
});
