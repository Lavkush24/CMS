function requirePlan(requiredPlan) {
  return (req, res, next) => {
    const user = req.user;

    // Handle expiry
    if (user.planExpiresAt && new Date() > user.planExpiresAt) {
      user.plan = "FREE";
    }

    if (requiredPlan === "PRO" && user.plan === "FREE") {
      return res.status(403).json({
        message: "Upgrade to Pro to access this feature"
      });
    }

    next();
  };
}

module.exports = requirePlan;