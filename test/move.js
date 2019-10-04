var test = require('tape')
var RSlice = require('../')
var calcMoves = require('./lib/move.js')
var valid = require('./lib/valid.js')

test('check move calculation', function (t) {
  var prev = new RSlice({
    A: {
      size: 10,
      slices: [[0,0.1428571428571429],[0.23901098901098902,0.25]]
    },
    B: {
      size: 15,
      slices: [[0.5,0.7307692307692308]]
    },
    C: {
      size: 20,
      slices: [
        [0.1785714285714286,0.2142857142857143],
        [0.21703296703296707,0.23901098901098902],
        [0.33333333333333337,0.41666666666666663],
        [0.8333333333333334,1]
      ]
    },
    D: {
      size: 20,
      slices: [
        [0.1428571428571429,0.1785714285714286],
        [0.2142857142857143,0.21703296703296707],
        [0.25,0.33333333333333337],
        [0.41666666666666663,0.5],
        [0.7307692307692308,0.8333333333333334]
      ]
    }
  })
  var cur = new RSlice({
    A: {
      size: 10,
      slices: [[0,0.11764705882352945]]
    },
    B: {
      size: 15,
      slices: [[0.5,0.6764705882352942]]
    },
    C: {
      size: 40,
      slices: [
        [0.11764705882352945,0.25],
        [0.299396681749623,0.41666666666666663],
        [0.6764705882352942,0.7307692307692308],
        [0.8333333333333334,1]
      ]
    },
    D: {
      size: 20,
      slices: [
        [0.25,0.299396681749623],
        [0.41666666666666663,0.5],
        [0.7307692307692308,0.8333333333333334]
      ]
    }
  })
  t.equal(round(calcMoves(prev, cur).toNumber(),10000),0.1629)
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
    var expected = 0
    var prevTotal = 0
    var bins = rs.getBins()
    Object.keys(bins).forEach(function (key) {
      prevTotal += bins[key].size
    })
    var newTotal = prevTotal
    Object.keys(op).forEach(function (key) {
      newTotal += op[key] - bins[key].size
    })
    Object.keys(op).forEach(function (key) {
      expected += Math.abs(bins[key].size / prevTotal - op[key] / newTotal)
    })
    rs.set(op)
    var moved = calcMoves(prev, rs).toNumber()
    t.equal(round(moved,10000),round(expected,10000), JSON.stringify(op))
    t.ifError(valid(rs), `valid after ${JSON.stringify(op)}`)
  })
  t.end()
})

function round (x, n) { return Math.round(x*n)/n }
