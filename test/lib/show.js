module.exports = function (rs) {
  Object.keys(rs._bins).forEach(function (key) {
    var b = rs._bins[key]
    var n = 10000
    console.log(key,b.size,JSON.stringify(b.slices.map(function (slice) {
      var start = slice[0].toNumber()
      var end = slice[1].toNumber()
      return [Math.round(start*n)/n,Math.round(end*n)/n]
    })))
  })
}
