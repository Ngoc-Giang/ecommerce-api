const express = require("express");
const {
  createOrder,
  getOrderById,
} = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/:oid", authMiddleware, getOrderById);

module.exports = router;