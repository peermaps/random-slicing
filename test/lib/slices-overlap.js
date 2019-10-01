module.exports = function (a, b) {
  var overlap = 0
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      overlap += Math.max(0, Math.min(
        a[i][1] - b[j][0],
        b[j][1] - a[i][0]
      ))
    }
  }
  return overlap
}
