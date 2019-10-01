var almostEqual = require('almost-equal')
var rat = require('big-rat')

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

RSlice.prototype.set = function (key, size) {
  var bin = this.bins[key]
  if (!bin) {
    bin = this.bins[key] = { size: 0, slices: [] }
    this._binKeys.push(key)
    this._binKeys.sort()
    if (this._binKeys.length === 1) {
      bin.size = size
      bin.slices.push([0,1])
      this._totalSize += size
      return
    }
  }
  var newSize = this._totalSize + (size - bin.size)
  var n = this._binKeys.length
  for (var i = 0; i < n; i++) {
    var k = this._binKeys[i]
    if (k === key) continue
    var b = this.bins[k]
    //var rem = bin.size / (n-1) / this._totalSize - size / (n-1) / newSize
    var rem = (b.size * newSize / this._totalSize - b.size) / newSize
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
    throw new Error('not matched')
  }
  bin.size = size
  for (var i = 0; i < n; i++) {
    var b = this.bins[this._binKeys[i]]
    cleanup(b)
  }
  this._totalSize = newSize
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
