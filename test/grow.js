var test = require('tape')
var RSlice = require('../')
var roundSlices = require('./lib/round-slices.js')

test('uniformly grow then adjust', function (t) {
  var rs = new RSlice
  rs.set('A', 20)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,1]] }
  })
  rs.set('B', 20)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.5]] },
    B: { size: 20, slices: [[0.5,1]] }
  })
  rs.set('C', 20)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.33]] },
    B: { size: 20, slices: [[0.5,0.83]] },
    C: { size: 20, slices: [[0.33,0.5],[0.83,1]] }
  })
  rs.set('D', 20)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.25]] },
    B: { size: 20, slices: [[0.5,0.75]] },
    C: { size: 20, slices: [[0.33,0.42],[0.83,1]] },
    D: { size: 20, slices: [[0.25,0.33],[0.42,0.5],[0.75,0.83]] }
  })
  rs.set('D', 30)
  t.deepEqual(roundSlices(rs.bins,2), {
    A: { size: 20, slices: [[0,0.22]] },
    B: { size: 20, slices: [[0.5,0.72]] },
    C: { size: 20, slices: [[0.33,0.39],[0.83,1]] },
    D: { size: 30, slices: [[0.22,0.33],[0.39,0.5],[0.72,0.83]] }
  })
  t.end()
})
