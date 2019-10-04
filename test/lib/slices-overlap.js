var R = require('../../lib/r.js')
var ZERO = R(0)
var tmp0 = R(0)
var tmp1 = R(0)

module.exports = function (a, b) {
  var overlap = R(0)
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      tmp0.multiply(ZERO)
      tmp0.add(a[i][1])
      tmp0.subtract(b[j][0])
      tmp1.multiply(ZERO)
      tmp1.add(b[j][1])
      tmp1.subtract(a[i][0])
      overlap.add(max(ZERO, min(tmp0, tmp1)))
    }
  }
  return overlap
}

function min (a, b) { return a.lt(b) ? a : b }
function max (a, b) { return a.gt(b) ? a : b }
