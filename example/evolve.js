var RSlice = require('../')
var valid = require('../test/lib/valid.js')

var rs = new RSlice
var keys = ['A','B','C','D','E','F','G']
keys.forEach(key => rs.set(key, 20))
show(rs)

for (var i = 0; i < 10000; i++) {
  var key = keys[Math.floor(Math.random()*keys.length)]
  var prevSize = rs.bins[key] ? rs.bins[key].size : 0
  var size = Math.max(0, prevSize + Math.floor((Math.random()*2-1)*8))
  if (size === 0 && rs._binKeys.length === 1 && rs._binKeys[0] === key) {
    size = 1
  }
  rs.set(key, Math.max(0, size))
  var err = valid(rs.bins)
  if (err) throw err
  show(rs)
}

function show (rs) {
  Object.keys(rs.bins).sort().forEach(function (key) {
    var b = rs.bins[key]
    var n = 10000
    console.log(key,b.size,JSON.stringify(b.slices.map(function (slice) {
      return [Math.round(slice[0]*n)/n,Math.round(slice[1]*n)/n]
    })))
  })
  console.log('---')
}
