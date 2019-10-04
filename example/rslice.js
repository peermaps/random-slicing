var RS = require('../')
var rs = new RS({
  A: { size: 40, slices: [[0.0,0.25]] },
  B: { size: 120, slices: [[0.25,1.0]] }
})
rs.set({ A: 32, C: 80 })

Object.entries(rs.getBins()).forEach(function ([key,bin]) {
  console.log(key, bin.size, bin.slices.map(showSlice).join(', '))
})

function showSlice ([start,end]) {
  return `${start[0]}/${start[1]}..${end[0]}/${end[1]}`
}
