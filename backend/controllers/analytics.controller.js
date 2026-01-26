import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// GET OVERALL ANALYTICS DATA
export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

// GET DAILY SALES DATA BETWEEN DATES
export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailySales.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    console.log("Error in getDailySalesData controller:", error.message);
    throw error;
  }
};

// HELPER FUNCTION — GET ALL DATES BETWEEN RANGE
function getDatesInRange(startDate, endDate) {
  const dateArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return dateArray;
}
