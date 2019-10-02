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
  var addedKey = false
  Object.keys(updates).forEach(function (key) {
    var bin = self.bins[key]
    newSize += updates[key] - (bin ? bin.size : 0)
    if (!bin) {
      if (updates[key] === 0) return
      bin = self.bins[key] = { size: 0, slices: [] }
      self._binKeys.push(key)
      addedKey = true
    }
  })
  if (addedKey) self._binKeys.sort()
  var updateKeys = Object.keys(updates).sort()
  if (self._totalSize === 0) {
    var offset = 0
    updateKeys.forEach(function (key) {
      self.bins[key].size = updates[key]
      self.bins[key].slices.push([
        offset,
        offset + updates[key] / newSize
      ])
      offset += updates[key] / newSize
    })
    self._totalSize = newSize
    return
  }
  updateKeys.forEach(function (key) {
    var size = updates[key]
    if (size < 0) throw new Error('size must be positive. received: ' + size)
    var bin = self.bins[key]
    var n = self._binKeys.length
    for (var i = 0; i < n; i++) {
      var k = self._binKeys[i]
      if (k === key) continue
      if (updates.hasOwnProperty(k)) continue
      var b = self.bins[k]
      var rem = (b.size * newSize / self._totalSize - b.size) / newSize
      if (almostEqual(rem, 0.0)) continue
      var src, dst
      if (rem > 0) {
        src = b
        dst = bin
      } else {
        src = bin
        dst = b
        rem *= -1
      }
      var matched = false
      // first search for an exact size segment to swap out
      for (var j = 0; j < src.slices.length; j++) {
        var len = length(src.slices[j])
        if (almostEqual(len, rem)) {
          rem -= len
          dst.slices.push(src.slices[j])
          src.slices.splice(j,1)
          matched = true
          break
        }
      }
      if (matched) continue
      // otherwise keep assigning smaller intervals 
      for (var j = 0; j < src.slices.length; j++) {
        var len = length(src.slices[j])
        if (len <= rem) {
          dst.slices.push(src.slices[j])
          src.slices.splice(j,1)
          j--
          rem -= len
          if (almostEqual(rem, 0.0)) {
            matched = true
            break
          }
        }
      }
      if (matched) continue
      // otherwise find a suitable node to split
      for (var j = 0; j < src.slices.length; j++) {
        var len = length(src.slices[j])
        if (len > rem) {
          dst.slices.push([src.slices[j][1]-rem,src.slices[j][1]])
          src.slices[j][1] -= rem
          matched = true
          break
        }
      }
      if (matched) continue
      if (size > 0) {
        throw new Error('not matched: ' + key + ': ' + size)
      }
    }
    bin.size = size
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
