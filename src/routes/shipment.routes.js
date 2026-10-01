const express = require("express");

const {
  createShipment,
  updateShipment,
} = require("../controllers/shipment.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { requireRole, ROLE } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/orders/:oid/shipment", authMiddleware, requireRole(ROLE.ADMIN), createShipment);
router.patch("/orders/:oid/shipment", authMiddleware, requireRole(ROLE.ADMIN), updateShipment);

module.exports = router;