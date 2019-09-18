var RSlice = require('../')
var rs = new RSlice({
  A: { size: 40, slices: [[0,0.25]] },
  B: { size: 120, slices: [[0.25,1]] }
})
rs.set('C', 80)
Object.entries(rs.bins).forEach(([name,bin]) => {
  console.log(name, JSON.stringify(bin))
})
