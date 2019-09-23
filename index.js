var almostEqual = require('almost-equal')

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
  self._binKeys = Object.keys(self.bins)
  self._binKeys.forEach(function (key) {
    self._totalSize += self.bins[key].size
  })
}

RSlice.prototype.set = function (key, size) {
  var self = this
  var n = this._binKeys.length
  var bin = this.bins[key]
  if (!bin) {
    bin = this.bins[key] = { size: 0, slices: [] }
    this._binKeys.push(key)
    if (n === 0) {
      bin.size = size
      bin.slices.push([0,1])
      this._totalSize += size
      this.slices.push([key,0,1])
      return
    }
  }
  var newSize = this._totalSize + (size - bin.size)
  bin.size = size
  for (var i = 0; i < n; i++) {
    var b = this.bins[this._binKeys[i]]
    var take = bin.size / n
    var takeFloat = take / newSize
    for (var j = 0; j < b.slices.length; j++) {
      var prevFloatSize = length(b.slices[j])
      var newFloatSize = prevFloatSize * this._totalSize/newSize
      var remFloatSize = prevFloatSize - newFloatSize
      var matched = false
      // first search for an exact size segment to swap out
      for (var k = 0; k < b.slices.length; k++) {
        if (almostEqual(length(b.slices[k]), remFloatSize)) {
          matched = true
          bin.slices.push(b.slices[k])
          this.slices.push([key,bin.slices[k][0],bin.slices[k][1]])
          b.slices.splice(k,1)
          break
        }
      }
      if (matched) continue
      // otherwise keep assigning smaller intervals 
      for (var k = 0; k < b.slices.length; k++) {
        var len = length(b.slices[k])
        if (almostEqual(len, remFloatSize)) {
          matched = true
          bin.slices.push(b.slices[k])
          this.slices.push([key,bin.slices[k][0],bin.slices[k][1]])
          b.slices.splice(k,1)
          break
        } else if (len < remFloatSize) {
          remFloatSize -= len
          bin.slices.push(b.slices[k])
          this.slices.push([key,bin.slices[k][0],bin.slices[k][1]])
          b.slices.splice(k,1)
        }
      }
      if (matched) continue
      // find a suitable node to split
      for (var k = 0; k < b.slices.length; k++) {
        // (should always be the first one)
        var iv = b.slices[0]
        var len = length(iv)
        if (len < remFloatSize) continue
        bin.slices.push([iv[1]-remFloatSize,iv[1]])
        this.slices.push([key,iv[1]-remFloatSize,iv[1]])
        iv[1] -= remFloatSize
        break
      }
    }
  }
  // sort and combine adjacent slices
  bin.slices.sort(cmpIv)
  for (var i = 1; i < bin.slices.length; i++) {
    if (adjacent(bin.slices[i-1],bin.slices[i])) {
      bin.slices[i-1][1] = bin.slices[i][1]
      bin.slices.splice(i,1)
      i--
    }
  }
  this._totalSize = newSize
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
