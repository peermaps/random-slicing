var calcOverlap = require('./slices-overlap.js')

module.exports = function (a, b) {
  var okeys = {}
  Object.keys(a).forEach(key => { okeys[key] = true })
  Object.keys(b).forEach(key => { okeys[key] = true })
  var keys = Object.keys(okeys)
  var overlap = 0
  keys.forEach(function (key) {
    var delta = calcOverlap(a[key].slices, b[key].slices)
    overlap += Math.max(0, length(a[key].slices) - delta)
  })
  return overlap
}

function length (slices) {
  var len = 0
  for (var i = 0; i < slices.length; i++) {
    len += slices[i][1] - slices[i][0]
  }
  return len
}
