const authenticateToken = require("../middlewares/auth.middleware");
const { requireRole, ROLE } = require("../middlewares/role.middleware");
const express = require("express");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", authenticateToken, getAllProducts);
router.get("/:id", authenticateToken, getProductById);
router.post("/", authenticateToken, requireRole(ROLE.ADMIN), createProduct);
router.put("/:id", authenticateToken, requireRole(ROLE.ADMIN), updateProduct);
router.delete("/:id", authenticateToken, requireRole(ROLE.ADMIN), deleteProduct);

module.exports = router;