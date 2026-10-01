const express = require("express");
const prisma = require("./config/prisma");

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const shipmentRoutes = require("./routes/shipment.routes");

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", shipmentRoutes);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      message: "E-commerce API is running",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

module.exports = app;