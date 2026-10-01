const ROLE = { CUSTOMER: 1, ADMIN: 2 };

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.roleid)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
    });
  }
  next();
};

module.exports = { requireRole, ROLE };