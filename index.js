var almostEqual = require('almost-equal')
var rat = require('big-rat')

module.exports = RSlice

function RSlice (slicesOrBins) {
  var self = this
  if (!(self instanceof RSlice)) return new RSlice(slicesOrBins)
  if (Array.isArray(slicesOrBins)) {
    self.slices = slicesOrBins
    self.bins = binsFromSlices(self.slices)
  } else {
    self.bins = slicesOrBins || {}
    self.slices = slicesFromBins(self.bins)
  }
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
      //this.slices.push([key,0,1])
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
    // todo: convert to 2-pass. only split on 2nd pass
    for (var j = 0; j < src.slices.length; j++) {
      // todo: slurp up smallest slices first?
      var len = length(src.slices[j])
      if (almostEqual(len, rem)) {
        rem -= len
        dst.slices.push(src.slices[j])
        src.slices.splice(j,1)
        break
      } else if (len < rem) {
        dst.slices.push(src.slices[j])
        src.slices.splice(j,1)
        j--
        rem -= len
      } else {
        dst.slices.push([src.slices[j][1]-rem,src.slices[j][1]])
        src.slices[j][1] -= rem
        break
      }
    }
    cleanup(b)
  }
  bin.size = size
  cleanup(bin)
  this._totalSize = newSize
}
RSlice.prototype._grow = function (key, size) {
  var self = this
  var n = this._binKeys.length
  var bin = this.bins[key]
  var newSize = this._totalSize + (size - bin.size)
  bin.size = size
  for (var i = 0; i < n; i++) {
    if (this._binKeys[i] === key) continue
    var b = this.bins[this._binKeys[i]]
    for (var j = 0; j < b.slices.length; j++) {
      var prevFloatSize = length(b.slices[j])
      var newFloatSize = prevFloatSize * this._totalSize/newSize
      var remFloatSize = prevFloatSize - newFloatSize
      if (Math.abs(remFloatSize) < 0.00001) continue
      var matched = false
      var src, dst
      if (remFloatSize > 0) {
        src = b
        dst = bin
      } else {
        src = bin
        dst = b
        remFloatSize *= -1
      }
      // first search for an exact size segment to swap out
      for (var k = 0; k < src.slices.length; k++) {
        if (almostEqual(length(src.slices[k]), remFloatSize)) {
          matched = true
          dst.slices.push(src.slices[k])
          //this.slices.push([key,dst.slices[k][0],dst.slices[k][1]])
          src.slices.splice(k,1)
          break
        }
      }
      if (matched) continue
      // otherwise keep assigning smaller intervals 
      for (var k = 0; k < src.slices.length; k++) {
        var len = length(src.slices[k])
        if (almostEqual(len, remFloatSize)) {
          matched = true
          dst.slices.push(src.slices[k])
          //this.slices.push([key,dst.slices[k][0],dst.slices[k][1]])
          src.slices.splice(k,1)
          break
        } else if (len < remFloatSize) {
          remFloatSize -= len
          dst.slices.push(src.slices[k])
          //this.slices.push([key,dst.slices[k][0],dst.slices[k][1]])
          src.slices.splice(k,1)
          k--
        }
      }
      if (matched) continue
      // find a suitable node to split
      for (var k = 0; k < src.slices.length; k++) {
        // (should always be the first one)
        var iv = src.slices[0]
        var len = length(iv)
        if (len < remFloatSize) continue
        dst.slices.push([iv[1]-remFloatSize,iv[1]])
        //this.slices.push([key,iv[1]-remFloatSize,iv[1]])
        iv[1] -= remFloatSize
        matched = true
        break
      }
      if (matched) continue
      if (!almostEqual(remFloatSize,0.0)) {
        throw new Error('grow not matched: ' + remFloatSize)
      }
    }
  }
  // sort and combine adjacent slices
  cleanup(dst)
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

function slicesFromBins (bins) {
  var slices = []
  Object.keys(bins).forEach(function (key) {
    var bin = bins[key]
    bin.slices.forEach(function (slice) {
      slices.push([key,slice[0],slice[1]])
    })
  })
  return slices
}

function binsFromSlices (slices) {
  var bins = {}
  slices.forEach(function (slice) {
    var [key,start,end] = slice
    if (!bins[key]) bins[key] = { size: slice.size, slices: [] }
    bins[key].slices.push([start,end])
  })
  return bins
}

function adjacent (g, iv) {
  if (!g) return false
  return almostEqual(g[1],iv[0]) || almostEqual(g[0],iv[1])
}
function length (iv) { return iv[1]-iv[0] }
function cmpIv (a, b) {
  return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]
}
