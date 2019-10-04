var RSlice = require('../')
var rs = new RSlice({
  A: { size: 40, slices: [[0,0.25]] },
  B: { size: 120, slices: [[0.25,1]] }
})
rs.set({ C: 80, D: 20 })

Object.entries(rs.getBins()).forEach(function ([key,bin]) {
  console.log(key, bin.slices.map(showSlice).join(', '))
})

function showSlice (slice) {
  return '[' + slice[0][0] + '/' + slice[0][1]
    + '..' + slice[1][0] + '/' + slice[1][1] + ']'
}
