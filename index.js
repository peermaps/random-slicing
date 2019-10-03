var almostEqual = require('almost-equal')

module.exports = RSlice

function RSlice (bins) {
  var self = this
  if (!(self instanceof RSlice)) return new RSlice(bins)
  self.bins = bins || {}
  self._totalSize = 0
  self._binKeys = Object.keys(self.bins).sort()
  self._binKeys.forEach(function (key) {
    self._totalSize += self.bins[key].size
  })
}

RSlice.prototype.set = function (updates) {
  var self = this
  var newSize = self._totalSize
  Object.keys(updates).forEach(function (key) {
    var bin = self.bins[key]
    newSize += updates[key] - (bin ? bin.size : 0)
  })
  if (self._binKeys.length === 0) {
    var offset = 0
    Object.keys(updates).forEach(function (key) {
      var slices = [[ offset, offset+updates[key] / newSize ]]
      offset += updates[key] / newSize
      self.bins[key] = { size: updates[key], slices }
      self._binKeys.push(key)
      self._totalSize += updates[key]
    })
    self._binKeys.sort()
    return
  }
  var addedKey = false
  Object.keys(updates).forEach(function (key) {
    if (!self.bins[key]) {
      self.bins[key] = { size: 0, slices: [] }
      self._binKeys.push(key)
      addedKey = true
    }
  })
  if (addedKey) self._binKeys.sort()

  // first phase: shrink intervals by removing gaps
  var gaps = []
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var bin = self.bins[key]
    var newBinSize = updates.hasOwnProperty(key) ? updates[key] : bin.size
    var newRatio = newBinSize / newSize
    var ratio = sliceSum(bin.slices)
    var delta = ratio - newRatio
    if (delta <= 0.0) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(iv)
      if (!almostEqual(delta, len)) continue
      gaps.push(iv)
      bin.slices.splice(j,1)
      matched = true
      break
    }
    if (matched) continue
    // assign smaller intervals to gaps
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(iv)
      if (len > delta) continue
      gaps.push(iv)
      bin.slices.splice(j,1)
      j--
      delta -= len
      if (almostEqual(delta, 0.0)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable node to split
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(iv)
      if (len < delta) continue
      gaps.push([iv[1]-delta,iv[1]])
      iv[1] -= delta
      matched = true
      break
    }
    if (matched) continue
    throw new Error('not matched: ' + key + ': ' + newBinSize)
  }
  // second phase: assign gaps to intervals that need to grow
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var bin = self.bins[key]
    var newBinSize = updates.hasOwnProperty(key) ? updates[key] : bin.size
    var newRatio = newBinSize / newSize
    var ratio = sliceSum(bin.slices)
    var delta = newRatio - ratio
    if (delta <= 0.0) continue
    if (almostEqual(delta, 0.0)) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(iv)
      if (!almostEqual(len, delta)) continue
      bin.slices.push(iv)
      gaps.splice(j,1)
      matched = true
      break
    }
    if (matched) continue
    // assign smaller gaps
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(iv)
      if (len > delta) continue
      bin.slices.push(iv)
      gaps.splice(j,1)
      j--
      delta -= len
      if (almostEqual(delta, 0.0)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable gap to split
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(iv)
      if (almostEqual(len, delta)) {
        bin.slices.push(iv)
        gaps.splice(j,1)
        matched = true
        break
      } else if (len < delta) continue
      bin.slices.push([iv[1]-delta,iv[1]])
      iv[1] -= delta
      matched = true
      break
    }
    if (matched) continue
    throw new Error('not matched: ' + key + ': ' + newBinSize)
  }
  if (gaps.length > 0) throw new Error('gaps remain: ' + JSON.stringify(gaps))
  // ---
  var updateKeys = Object.keys(updates)
  updateKeys.forEach(function (key) {
    var bin = self.bins[key]
    bin.size = updates[key]
  })
  for (var i = 0; i < self._binKeys.length; i++) {
    var b = self.bins[self._binKeys[i]]
    if (b.size === 0) {
      delete self.bins[self._binKeys[i]]
      self._binKeys.splice(i,1)
      i--
    } else cleanup(b)
  }
  self._totalSize = newSize
}

function sliceSum (slices) {
  var sum = 0
  for (var i = 0; i < slices.length; i++) {
    sum += slices[i][1] - slices[i][0]
  }
  return sum
}

function cleanup (dst) {
  // sort, remove 0-width, and combine adjacent slices
  dst.slices.sort(cmpIv)
  for (var i = 0; i < dst.slices.length; i++) {
    if (almostEqual(length(dst.slices[i]),0)) {
      dst.slices.splice(i,1)
      i--
    }
  }
  for (var i = 1; i < dst.slices.length; i++) {
    if (adjacent(dst.slices[i-1],dst.slices[i])) {
      dst.slices[i-1][1] = dst.slices[i][1]
      dst.slices.splice(i,1)
      i--
    }
  }
}

function adjacent (g, iv) {
  if (!g) return false
  return almostEqual(g[1],iv[0]) || almostEqual(g[0],iv[1])
}
function length (iv) { return iv[1]-iv[0] }
function cmpIv (a, b) {
  return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]
}
