function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

function isNumber(value) {
  return !isNaN(value);
}

module.exports = {
  isEmpty,
  isNumber
};