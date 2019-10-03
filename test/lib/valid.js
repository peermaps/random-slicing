module.exports = function (bins) {
  var total = 0
  var binKeys = Object.keys(bins)
  for (var i = 0; i < binKeys.length; i++) {
    total += bins[binKeys[i]].size
  }
  var totalFloat = 0
  for (var i = 0; i < binKeys.length; i++) {
    var b = bins[binKeys[i]]
    var ratio = 0
    for (var j = 0; j < b.slices.length; j++) {
      var iv = b.slices[j]
      if (iv[0].gte(iv[1])) {
        return new Error(`invalid interval in
          ${binKeys[i]}:${j} [${iv}]`)
      }
      ratio += iv[1].toNumber() - iv[0].toNumber()
    }
    totalFloat += ratio
    if (Math.abs(ratio - b.size / total) > 0.0001) {
      return new Error(`invalid ratio in ${binKeys[i]}:
        ${b.size} / ${total}. expected: ${b.size/total}. actual: ${ratio}`)
    }
  }
  if (Math.abs(totalFloat-1.0) > 0.0001) {
    return new Error(`invalid total: ${totalFloat}`)
  }
  var slices = []
  for (var i = 0; i < binKeys.length; i++) {
    var b = bins[binKeys[i]]
    slices = slices.concat(b.slices)
  }
  for (var i = 0; i < slices.length; i++) {
    var a = slices[i]
    for (var j = i+1; j < slices.length; j++) {
      var b = slices[j]
      if (a[0].lt(b[1]) && a[1].gt(b[0])) return new Error('overlap')
    }
  }
}
