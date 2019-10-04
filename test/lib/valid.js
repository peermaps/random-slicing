var rat = require('../../lib/rat.js')

module.exports = function (rs) {
  var total = 0
  for (var i = 0; i < rs._binKeys.length; i++) {
    total += rs._bins[rs._binKeys[i]].size
  }
  var totalFloat = 0
  for (var i = 0; i < rs._binKeys.length; i++) {
    var b = rs._bins[rs._binKeys[i]]
    var ratio = 0
    for (var j = 0; j < b.slices.length; j++) {
      var iv = b.slices[j]
      if (rat.gte(iv[0],iv[1])) {
        return new Error(`invalid interval in
          ${rs._binKeys[i]}:${j} [${iv}]`)
      }
      ratio += Number(iv[1].toString()) - Number(iv[0].toString())
    }
    totalFloat += ratio
    if (Math.abs(ratio - b.size / total) > 0.0001) {
      return new Error(`invalid ratio in ${rs._binKeys[i]}:
        ${b.size} / ${total}. expected: ${b.size/total}. actual: ${ratio}`)
    }
  }
  if (Math.abs(totalFloat-1.0) > 0.0001) {
    return new Error(`invalid total: ${totalFloat}`)
  }
  var slices = []
  for (var i = 0; i < rs._binKeys.length; i++) {
    var b = rs._bins[rs._binKeys[i]]
    slices = slices.concat(b.slices)
  }
  for (var i = 0; i < slices.length; i++) {
    var a = slices[i]
    for (var j = i+1; j < slices.length; j++) {
      var b = slices[j]
      if (rat.lt(a[0],b[1]) && rat.gt(a[1],b[0])) {
        return new Error('overlap')
      }
    }
  }
}
