var BN = require('bn.js')
var { createHash } = require('crypto')

var RS = require('../')
var rs = new RS
rs.set({ A: 40, B: 100 })
rs.set({ A: 32, C: 80 })
rs.set({ D: 50, B: 110 })

// scale the slices up into 2**256 to get sha256 hash ranges
var buckets = []
var max = new BN(2).pow(new BN(256)).sub(new BN(1))
Object.entries(rs.getBins()).forEach(([key,bin]) => {
  bin.slices.forEach(([start,end]) => {
    var a = new BN(start[0]).mul(max).div(new BN(start[1]))
    var b = new BN(end[0]).mul(max).div(new BN(end[1]))
    buckets.push([
      a.toString(16).padStart(64,'0'),
      b.toString(16).padStart(64,'0'),
      key
    ])
  })
})
buckets.sort((a,b) => a[0] < b[0] ? -1 : +1)

console.log(`meow => ${lookup('meow')}`)   // D
console.log(`kitty => ${lookup('kitty')}`) // B
console.log(`oof => ${lookup('oof')}`)     // B
console.log(`gecko => ${lookup('gecko')}`) // D
console.log(`toad => ${lookup('toad')}`)   // A

function lookup (key) {
  var h = createHash('sha256')
  h.write(key)
  var hash = h.digest('hex')
  for (var i = 0; i < buckets.length; i++) {
    if (hash < buckets[i][1]) return buckets[i][2]
  }
  return null
}
