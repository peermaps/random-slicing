var { createHash } = require('crypto')

var RS = require('../')
var rs = new RS
rs.set({ A: 40, B: 100 })
rs.set({ A: 32, C: 80 })
rs.set({ D: 50, B: 110 })
rs.set({ A: 20, B: 20, C: 20, D: 20 })
rs.set({ A: 10 })
rs.set({ B: 15 })
rs.set({ C: 40 })
rs.set({ B: 12 })
rs.set({ D: 17 })
rs.set({ A: 5 })
rs.set({ B: 25 })

// scale the slices up into 2**256 to get sha256 hash ranges
var buckets = []
var max = 2n**256n-1n
Object.entries(rs.getBins()).forEach(([key,bin]) => {
  bin.slices.forEach(([start,end]) => {
    buckets.push([
      (start[0]*max/start[1]).toString(16).padStart(64,'0'),
      (end[0]*max/end[1]).toString(16).padStart(64,'0'),
      key
    ])
  })
})
buckets.sort((a,b) => a[0] < b[0] ? -1 : +1)

buckets.forEach(([start,end,key]) => {
  console.log(key, start)
  console.log(end.padStart(key.length+1+end.length))
  console.log()
})
