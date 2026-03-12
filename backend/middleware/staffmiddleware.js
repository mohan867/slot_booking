const isStaff = (req, res, next) => {
  if (req.session.user && req.session.user.role === "staff") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Staff only." });
  }
};

module.exports = isStaff;
