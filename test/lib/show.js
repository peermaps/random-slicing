module.exports = function (bins) {
  Object.keys(bins).forEach(function (key) {
    var b = bins[key]
    var n = 10000
    console.log(key,b.size,JSON.stringify(b.slices.map(function (slice) {
      return [Math.round(slice[0]*n)/n,Math.round(slice[1]*n)/n]
    })))
  })
}
