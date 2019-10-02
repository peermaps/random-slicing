var test = require('tape')
var RSlice = require('../')
var calcMoves = require('./lib/move.js')
var copy = require('./lib/copy.js')
var valid = require('./lib/valid.js')
var show = require('./lib/show.js')

test('multi', function (t) {
  var rs = new RSlice
  rs.set({ A: 20, B: 20, C: 20, D: 20 })
  t.ifError(valid(rs.bins))
  var prev = copy(rs.bins)
  rs.set({ A: 40, B: 40, C: 40, D: 40 })
  t.ifError(valid(rs.bins))
  var moved = calcMoves(prev, rs.bins)
  t.equal(moved, 0.0, 'no moves for scaled update')
  show(rs.bins)
  console.log('---')
  rs.set({ A: 40, B: 40, C: 50, D: 55 })
  show(rs.bins)
  t.ifError(valid(rs.bins))
  prev = copy(rs.bins)
  var moved = calcMoves(prev, rs.bins)
  t.equal(
    round(moved,10000),
    round((10+15)/(40+40+40+50+55), 10000),
    'moves after multi-grow'
  )
  t.ifError(valid(rs.bins))
  t.end()
})

function round (x, n) { return Math.round(x*n)/n }
