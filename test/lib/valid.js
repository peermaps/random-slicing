module.exports = function (bins) {
  var valid = true
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
      if (iv[0] >= iv[1]) {
        return new Error(`invalid interval in
          ${binKeys[i]}:${j} [${iv}]`)
      }
      ratio += iv[1] - iv[0]
    }
    totalFloat += ratio
    if (Math.abs(ratio - b.size / total) > 0.0001) {
      return new Error(`invalid ratio in ${binKeys[i]}:
        ${b.size} / ${total} != ${ratio} (expected). actual: ${b.size/total}`)
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
      if (a[0] < b[1] && a[1] > b[0]) return new Error('overlap')
    }
  }
}
