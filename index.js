var R = require('./lib/r.js')
var almostEqual = require('almost-equal')
var EP = almostEqual.FLT_EPSILON

module.exports = RSlice

function RSlice (bins) {
  var self = this
  if (!(self instanceof RSlice)) return new RSlice(bins)
  self.bins = {}
  if (bins) {
    Object.keys(bins).forEach(function (key) {
      self.bins[key] = {
        size: bins[key].size,
        slices: bins[key].slices.map(function (iv) {
          return [R(iv[0]),R(iv[1])]
        })
      }
    })
  }
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
    var offset = R(0)
    Object.keys(updates).forEach(function (key) {
      var slices = [[
        offset.copy(),
        R(updates[key],newSize).add(offset)
      ]]
      offset.add(R(updates[key],newSize))
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
    var newRatio = R(newBinSize,newSize)
    var ratio = sliceSum(bin.slices)
    var delta = ratio.copy().subtract(newRatio) // amount to shrink
    if (delta.lte(0.0)) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(iv)
      if (!len.eq(delta, len)) continue
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
      if (len.gt(delta)) continue
      gaps.push(iv)
      bin.slices.splice(j,1)
      j--
      delta.subtract(len)
      if (delta.eq(0.0)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable node to split
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(iv)
      if (len.lt(delta)) continue
      if (delta.eq(len)) {
        gaps.push(iv)
        bin.slices.splice(j,1)
        matched = true
        break
      }
      gaps.push([iv[1].copy().subtract(delta),iv[1].copy()])
      iv[1].subtract(delta)
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
    var newRatio = R(newBinSize,newSize)
    var ratio = sliceSum(bin.slices)
    var delta = newRatio.copy().subtract(ratio) // amount to grow
    if (delta.lte(0.0)) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(iv)
      if (!delta.eq(len)) continue
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
      if (len.gt(delta)) continue
      bin.slices.push(iv)
      gaps.splice(j,1)
      j--
      delta.subtract(len)
      if (delta.eq(0.0)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable gap to split
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(iv)
      if (len.eq(delta)) {
        bin.slices.push(iv)
        gaps.splice(j,1)
        matched = true
        break
      } else if (len.lt(delta)) continue
      bin.slices.push([iv[1].copy().subtract(delta),iv[1].copy()])
      iv[1].subtract(delta)
      matched = true
      break
    }
    if (matched) continue
    if (delta.eq(0.0)) continue
    throw new Error('not matched: ' + key + ': ' + newBinSize)
  }
  if (gaps.length > 0) throw new Error('gaps remain: ' + displayGaps(gaps))
  // ---
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var b = self.bins[key]
    if (updates.hasOwnProperty(key)) {
      b.size = updates[key]
    }
    if (b.size === 0) {
      delete self.bins[self._binKeys[i]]
      self._binKeys.splice(i,1)
      i--
    } else cleanup(b)
  }
  self._totalSize = newSize
}

function sliceSum (slices) {
  var sum = R(0)
  for (var i = 0; i < slices.length; i++) {
    sum.add(slices[i][1])
    sum.subtract(slices[i][0])
  }
  return sum
}

function cleanup (dst) {
  // sort, remove 0-width, and combine adjacent slices
  dst.slices.sort(cmpIv)
  for (var i = 0; i < dst.slices.length; i++) {
    if (length(dst.slices[i]).eq(0.0)) {
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
  return g[1].eq(iv[0]) || g[0].eq(iv[1])
}
function length (iv) {
  return iv[1].copy().subtract(iv[0])
}
function cmpIv (a, b) {
  return a[0].eq(b[0]) ? a[1].compare(b[1]) : a[0].compare(b[0])
}

function displayGaps (gaps) {
  return '[' + gaps.map(function (g) {
    return '(' + g[0] + '..' + g[1] + ')'
  }).join(', ') + ']'
}
