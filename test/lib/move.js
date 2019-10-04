var R = require('../../lib/r.js')
var calcOverlap = require('./slices-overlap.js')
var ZERO = R(0)
var tmp = R(0)

module.exports = function (a, b) {
  var okeys = {}
  Object.keys(a._bins).forEach(key => { okeys[key] = true })
  Object.keys(b._bins).forEach(key => { okeys[key] = true })
  var keys = Object.keys(okeys)
  var overlap = R(0)
  keys.forEach(function (key) {
    var delta = calcOverlap(a._bins[key].slices, b._bins[key].slices)
    tmp.multiply(ZERO)
    tmp.add(length(a._bins[key].slices))
    tmp.subtract(delta)
    if (tmp.gt(ZERO)) overlap.add(tmp)
  })
  return overlap
}

function length (slices) {
  var len = R(0)
  for (var i = 0; i < slices.length; i++) {
    len.add(slices[i][1])
    len.subtract(slices[i][0])
  }
  return len
}
