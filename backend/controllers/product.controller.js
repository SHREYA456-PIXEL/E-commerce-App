import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      products: [],
      message: "All products fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await Product.find({ isFeatured: true });
    if (!featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    //if not in redis, fetch from mongodb
    //.lean() to get plain js objects instead of mongodb documents

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await Redis.set("featuredProducts", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error fetching featured products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, catagory } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const prouct = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse ? clodinaryResponse.secure_url : "",
      catagory,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
      }
    }

    await product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      }, // Adjust size as needed
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controllers:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });

    res.json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updatedFeaturedProductCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updatedFeaturedProductCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating featured products cache:", error.message);
  }
}
