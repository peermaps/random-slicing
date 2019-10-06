var rat = require('bigint-rational')
var calcOverlap = require('./slices-overlap.js')
var tmp = [0n,1n]
var ZERO = [0n,1n]

module.exports = function (a, b) {
  var okeys = {}
  Object.keys(a._bins).forEach(key => { okeys[key] = true })
  Object.keys(b._bins).forEach(key => { okeys[key] = true })
  var keys = Object.keys(okeys)
  var overlap = rat.create(0,1)
  keys.forEach(function (key) {
    var delta = calcOverlap(a._bins[key].slices, b._bins[key].slices)
    rat.subtract(tmp, length(a._bins[key].slices), delta)
    if (rat.gt(tmp, ZERO)) rat.add(overlap, overlap, tmp)
  })
  rat.reduce(overlap, overlap)
  return overlap
}

function length (slices) {
  var len = rat.create(0,1)
  for (var i = 0; i < slices.length; i++) {
    rat.add(len, len, slices[i][1])
    rat.subtract(len, len, slices[i][0])
  }
  return len
}
