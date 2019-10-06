var rat = require('bigint-rational')
var ZERO = rat.create(0,1)
var tmp0 = rat.create(0,1)
var tmp1 = rat.create(0,1)

module.exports = function (a, b) {
  var overlap = rat.create(0,1)
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      rat.multiply(tmp0, tmp0, ZERO)
      rat.add(tmp0,tmp0, a[i][1])
      rat.subtract(tmp0, tmp0, b[j][0])
      rat.multiply(tmp1, tmp1, ZERO)
      rat.add(tmp1, tmp1, b[j][1])
      rat.subtract(tmp1, tmp1, a[i][0])
      rat.add(overlap, overlap, max(ZERO, min(tmp0, tmp1)))
    }
  }
  rat.reduce(overlap, overlap)
  return overlap
}

function min (a, b) { return rat.lt(a,b) ? a : b }
function max (a, b) { return rat.gt(a,b) ? a : b }
