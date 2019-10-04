var RS = require('../')
var rs = new RS
rs.set({ A: 20, B: 20, C: 20, D: 20 })
show(rs)
rs.set({ A: 10 })
show(rs)
rs.set({ B: 15 })
show(rs)
rs.set({ C: 40 })
show(rs)
rs.set({ B: 12 })
show(rs)
rs.set({ D: 17 })
show(rs)
rs.set({ A: 5 })
show(rs)
rs.set({ B: 25 })
show(rs)

function show (rs) {
  Object.entries(rs.getBins()).forEach(function ([key,b]) {
    var n = 10000
    console.log(key, b.size, b.slices.map(([start,end]) => {
      return `[${start[0]}/${start[1]}..${end[0]}/${end[1]}]`
    }).join(', '))
  })
  console.log('---')
}
