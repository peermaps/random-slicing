module.exports = function (a, b) {
  var overlap = 0
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      overlap += Math.max(0, Math.min(
        a[i][1].toNumber() - b[j][0].toNumber(),
        b[j][1].toNumber() - a[i][0].toNumber()
      ))
    }
  }
  return overlap
}
