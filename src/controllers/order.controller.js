const prisma = require("../config/prisma");
const { ROLE } = require("../middlewares/role.middleware");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const handleError = (res, error) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "Order items are required");
    }

    // Gộp các dòng trùng pid và kiểm tra dữ liệu
    const merged = new Map();
    for (const item of items) {
      const pid = Number(item.pid);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(pid) || pid <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new HttpError(400, "Each item needs a valid pid and a positive integer quantity");
      }
      merged.set(pid, (merged.get(pid) || 0) + quantity);
    }

    const uid = req.user.uid;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({ data: { uid } });

      for (const [pid, quantity] of merged) {
        const product = await tx.product.findUnique({ where: { pid } });
        if (!product) {
          throw new HttpError(404, `Product ${pid} not found`);
        }

        // Trừ tồn kho nguyên tử: chỉ trừ khi còn đủ hàng
        const updated = await tx.product.updateMany({
          where: { pid, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (updated.count === 0) {
          throw new HttpError(400, `Not enough stock for product ${product.pname}`);
        }

        await tx.orderDetail.create({
          data: { oid: newOrder.oid, pid, qty: quantity, unit_price: product.price },
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getOrderById = async (req, res) => {
  try {
    const oid = Number(req.params.oid);
    if (!Number.isInteger(oid) || oid <= 0) {
      throw new HttpError(400, "Invalid order id");
    }

    const order = await prisma.order.findUnique({
      where: { oid },
      include: {
        orderDetails: { include: { product: true } },
        shipments: true,
      },
    });

    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    // Chỉ chủ đơn hoặc ADMIN mới được xem
    if (order.uid !== req.user.uid && req.user.roleid !== ROLE.ADMIN) {
      throw new HttpError(403, "You do not have permission to view this order");
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
};