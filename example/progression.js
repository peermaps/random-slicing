var RSlice = require('../')

var rs = new RSlice
rs.set('A',20)
rs.set('B', 20)
rs.set('C', 20)
rs.set('D', 20)
show(rs)
rs.set('A', 10)
show(rs)
rs.set('B', 15)
show(rs)
rs.set('C', 40)
show(rs)
rs.set('B', 12)
show(rs)
rs.set('D', 17)
show(rs)
rs.set('A', 5)
show(rs)
rs.set('B', 25)
show(rs)

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
