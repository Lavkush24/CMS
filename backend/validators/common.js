function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

function isNumber(value) {
  return !isNaN(value);
}

function buildDateFilter(from, to) {
  const filter = {};

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  return filter;
}

module.exports = {
  isEmpty,
  isNumber,
  buildDateFilter
};