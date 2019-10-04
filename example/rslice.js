var RS = require('../')
var rs = new RS
rs.set({ A: 40, B: 120 })
rs.set({ A: 32, C: 80 })

Object.entries(rs.getBins()).forEach(function ([key,bin]) {
  console.log(key, bin.size, bin.slices.map(showSlice).join(', '))
})

function showSlice ([start,end]) {
  return `${start[0]}/${start[1]}..${end[0]}/${end[1]}`
}
