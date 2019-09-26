var test = require('tape')
var RSlice = require('../')
var roundSlices = require('./lib/round-slices.js')
var valid = require('./lib/valid.js')

test('shrink', function (t) {
  var rs = new RSlice
  rs.set('A',20)
  rs.set('B', 20)
  rs.set('C', 20)
  rs.set('D', 30)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.22]] },
    B: { size: 20, slices: [[0.5,0.72]] },
    C: { size: 20, slices: [[0.33,0.39],[0.83,1]] },
    D: { size: 30, slices: [[0.22,0.33],[0.39,0.5],[0.72,0.83]] }
  })
  t.ifError(valid(rs.bins))
  rs.set('D', 20)
  /*
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.25]] },
    B: { size: 20, slices: [[0.5,0.75]] },
    C: { size: 20, slices: [[0.33,0.42],[0.83,1]] },
    D: { size: 20, slices: [[0.25,0.33],[0.42,0.5],[0.75,0.83]] }
  })
  */
  t.ifError(valid(rs.bins))
  t.equal(rs.bins.D.size, 20)
  Object.keys(rs.bins).forEach(function (key) {
    var b = rs.bins[key]
    var n = 1000
    console.log(key,b.size,JSON.stringify(b.slices.map(function (slice) {
      return [Math.round(slice[0]*n)/n,Math.round(slice[1]*n)/n]
    })))
  })
  t.end()
})
