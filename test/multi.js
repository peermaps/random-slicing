var test = require('tape')
var RSlice = require('../')
var calcMoves = require('./lib/move.js')
var valid = require('./lib/valid.js')
var rat = require('../lib/rat.js')
var ZERO = [0n,1n]

test('multi', function (t) {
  var rs = new RSlice
  rs.set({ A: 20, B: 20, C: 20, D: 20 })
  t.ifError(valid(rs))
  var prev = new RSlice(rs.getBins())
  rs.set({ A: 40, B: 40, C: 40, D: 40 })
  t.ifError(valid(rs))
  var moved = calcMoves(prev, rs)
  t.ok(rat.eq(moved,ZERO), 'no moves for scaled update')
  prev = new RSlice(rs.getBins())
  rs.set({ A: 40, B: 40, C: 50, D: 55 })
  t.ifError(valid(rs))
  var moved = calcMoves(prev, rs)
  var expected = [0n,1n]
  var expected = rat.subtract([],
    [50n+55n,40n+40n+50n+55n],
    [40n+40n,40n+40n+40n+40n]
  )
  rat.simplify(expected, expected)
  t.deepEqual(moved, expected, 'moves after multi-grow')
  t.ifError(valid(rs))
  t.end()
})

function round (x, n) { return Math.round(x*n)/n }
