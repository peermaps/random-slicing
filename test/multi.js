var test = require('tape')
var RSlice = require('../')
var calcMoves = require('./lib/move.js')
var valid = require('./lib/valid.js')
var R = require('../lib/r.js')

test('multi', function (t) {
  var rs = new RSlice
  rs.set({ A: 20, B: 20, C: 20, D: 20 })
  t.ifError(valid(rs))
  var prev = new RSlice(rs.getBins())
  rs.set({ A: 40, B: 40, C: 40, D: 40 })
  t.ifError(valid(rs))
  var moved = calcMoves(prev, rs)
  t.ok(moved.eq(R(0)), 'no moves for scaled update')
  prev = new RSlice(rs.getBins())
  rs.set({ A: 40, B: 40, C: 50, D: 55 })
  t.ifError(valid(rs))
  var moved = calcMoves(prev, rs).toNumber()
  t.equal(
    round(moved,10000),
    round((50+55)/(40+40+50+55)-(40+40)/(40+40+40+40), 10000),
    'moves after multi-grow'
  )
  t.ifError(valid(rs))
  t.end()
})

function round (x, n) { return Math.round(x*n)/n }
