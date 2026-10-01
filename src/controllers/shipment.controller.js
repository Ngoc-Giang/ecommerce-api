const prisma = require("../config/prisma");

const createShipment = async (req, res) => {
  try {
    const oid = Number(req.params.oid);

    // 1. Kiểm tra Order có tồn tại
    const order = await prisma.order.findUnique({
      where: {
        oid,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2. Tạo Shipment
    const shipment = await prisma.shipment.create({
      data: {
        oid,
        status: "Pending"
      },
    });

    return res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateShipment = async (req, res) => {
  try {
    const oid = Number(req.params.oid);
    const { status } = req.body;

    // 1. Kiểm tra status hợp lệ
    const allowedStatuses = ["Pending", "Shipped", "Delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment status",
      });
    }

    // 2. Tìm Shipment của Order
    const shipment = await prisma.shipment.findFirst({
      where: {
        oid,
      },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // 3. Cập nhật Shipment
    const updatedShipment = await prisma.shipment.update({
      where: {
        shipid: shipment.shipid,
      },
      data: {
        status
      },
    });

    return res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      data: updatedShipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createShipment,
  updateShipment,
};