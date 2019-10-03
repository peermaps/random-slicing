module.exports = function (bins) {
  var copy = {}
  Object.keys(bins).forEach(function (key) {
    copy[key] = {
      size: bins[key].size,
      slices: bins[key].slices.map(function (x) { return x.slice() })
    }
  })
  return copy
}