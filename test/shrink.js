var test = require('tape')
var RSlice = require('../')
var roundSlices = require('./lib/round-slices.js')
var valid = require('./lib/valid.js')

test('shrink', function (t) {
  var rs = new RSlice
  rs.set({ A: 20 })
  rs.set({ B: 20 })
  rs.set({ C: 20 })
  rs.set({ D: 30 })
  t.deepEqual(roundSlices(rs,2), {
    A: { size: 20, slices: [[0,0.22]] },
    B: { size: 20, slices: [[0.5,0.72]] },
    C: { size: 20, slices: [[0.33,0.39],[0.83,1]] },
    D: { size: 30, slices: [[0.22,0.33],[0.39,0.5],[0.72,0.83]] }
  })
  t.ifError(valid(rs), 'valid initial')
  rs.set({ D: 20 })
  t.ifError(valid(rs), 'valid after shrinking D')
  t.equal(rs.getBins().D.size, 20)
  t.end()
})

test('multi-grow/shrink', function (t) {
  var rs = new RSlice
  rs.set({ A: 20, B: 20, C: 20, D: 20 })
  t.ifError(valid(rs), 'valid initial')
  rs.set({ A: 10 })
  t.ifError(valid(rs), 'valid after shrinking A')
  rs.set({ B: 15 })
  t.ifError(valid(rs), 'valid after shrinking B')
  rs.set({ C: 40 })
  t.ifError(valid(rs), 'valid after growing C')
  rs.set({ B: 12 })
  t.ifError(valid(rs), 'valid after shrinking B')
  rs.set({ D: 17 })
  t.ifError(valid(rs), 'valid after shrinking D')
  rs.set({ A: 5 })
  t.ifError(valid(rs), 'valid after shrinking A')
  rs.set({ B: 25 })
  t.ifError(valid(rs), 'valid after growing B')
  t.equal(rs.getBins().A.size, 5)
  t.equal(rs.getBins().B.size, 25)
  t.equal(rs.getBins().C.size, 40)
  t.equal(rs.getBins().D.size, 17)
  t.end()
})
