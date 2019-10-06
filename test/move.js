var test = require('tape')
var rat = require('bigint-rational')
var RSlice = require('../')
var calcMoves = require('./lib/move.js')
var valid = require('./lib/valid.js')

var tmpr0 = [0n,1n]
var tmpr1 = [0n,1n]

test('check move calculation', function (t) {
  var prev = new RSlice({
    A: {
      size: 10,
      slices: [[[0n,1n],[1n,7n]],[[87n,364n],[1n,4n]]]
    },
    B: {
      size: 15,
      slices: [[[1n,2n],[19n,26n]]]
    },
    C: {
      size: 20,
      slices: [
        [[5n,28n],[3n,14n]],
        [[5n,23n],[87n,364n]],
        [[1n,3n],[5n,12n]],
        [[5n,6n],[1n,1n]]
      ]
    },
    D: {
      size: 20,
      slices: [
        [[1n,7n],[5n,28n]],
        [[3n,14n],[5n,23n]],
        [[1n,4n],[1n,3n]],
        [[5n,12n],[1n,2n]],
        [[19n,26n],[5n,6n]]
      ]
    }
  })
  var cur = new RSlice({
    A: {
      size: 10,
      slices: [[[0n,1n],[2n,17n]]]
    },
    B: {
      size: 15,
      slices: [[[1n,2n],[23n,34n]]]
    },
    C: {
      size: 40,
      slices: [
        [[2n,17n],[1n,4n]],
        [[397n,1326n],[5n,12n]],
        [[23n,34n],[19n,26n]],
        [[5n,6n],[1n,1n]]
      ]
    },
    D: {
      size: 20,
      slices: [
        [[1n,4n],[397n,1326n]],
        [[5n,12n],[1n,2n]],
        [[19n,26n],[5n,6n]]
      ]
    }
  })
  var moves = calcMoves(prev,cur)
  t.deepEqual(moves, [23235n,142324n], 'expected move ratio')
  t.end()
})

test('moves', function (t) {
  var rs = new RSlice
  rs.set({ A: 20, B: 20, C: 20, D: 20 })

  var ops = [
    { A: 10 }, // shrink
    { B: 15 }, // shrink
    { C: 40 }, // grow
    { B: 12 }, // shrink
    { D: 17 }, // shrink
    { A: 5 },  // shrink
    { B: 25 }  // grow
  ]
  ops.forEach(function (op) {
    var prev = new RSlice(rs.getBins())
    var prevTotal = 0
    var bins = rs.getBins()
    Object.keys(bins).forEach(function (key) {
      prevTotal += bins[key].size
    })
    var newTotal = prevTotal
    Object.keys(op).forEach(function (key) {
      newTotal += op[key] - bins[key].size
    })
    var expected = [0n,1n]
    Object.keys(op).forEach(function (key) {
      rat.set(tmpr0, bins[key].size, prevTotal)
      rat.set(tmpr1, op[key], newTotal)
      rat.subtract(tmpr0, tmpr0, tmpr1)
      rat.abs(tmpr0, tmpr0)
      rat.add(expected, expected, tmpr0)
    })
    rat.reduce(expected, expected)
    rs.set(op)
    var moved = calcMoves(prev, rs)
    t.deepEqual(moved, expected, `moved for ${JSON.stringify(op)}`)
    t.ifError(valid(rs), `valid after ${JSON.stringify(op)}`)
  })
  t.end()
})
