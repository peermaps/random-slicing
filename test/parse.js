var test = require('tape')
var RS = require('../')
var calcMoves = require('./lib/move.js')
var valid = require('./lib/valid.js')

test('serialize / parse', function (t) {
  var rs = new RS
  rs.set({ A: 50, B: 20, C: 44 })
  rs.set({ A: 65, C: 25, D: 15 })

  var str = rs.serialize()
  t.equal(typeof str, 'string')

  var copy = RS.parse(str)
  t.ifError(valid(copy), 'valid after parsing')

  var moves = calcMoves(rs, copy)

  t.deepEqual(moves, [0n,1n], 'no moves')
  t.deepEqual(rs.getBins(), copy.getBins(), 'bins equal')
  t.end()
})
