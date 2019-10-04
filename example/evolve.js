var RS = require('../')
var valid = require('../test/lib/valid.js')

var rs = new RS
var sizes = { A: 20, B: 20, C: 20, D: 20, E: 20, F: 20, G: 20 }
rs.set(sizes)
var keys = Object.keys(sizes)
var totalSize = 20*keys.length
show(rs)

for (var i = 0; i < 10000; i++) {
  var key = keys[Math.floor(Math.random()*keys.length)]
  var prevSize = sizes[key]
  var size = Math.max(0, prevSize + Math.floor((Math.random()*2-1)*8))
  if (size === 0 && totalSize === prevSize) {
    size = 1
  }
  var op = {}
  op[key] = Math.max(0, size)
  rs.set(op)
  totalSize += size - prevSize
  sizes[key] = size
  var err = valid(rs)
  if (err) throw err
  show(rs)
}

function show (rs) {
  Object.entries(rs.getBins()).forEach(function ([key,b]) {
    var n = 10000
    console.log(key, b.size, b.slices.map(([start,end]) => {
      return `[${start[0]}/${start[1]}..${end[0]}/${end[1]}]`
    }).join(', '))
  })
  console.log('---', i)
}
