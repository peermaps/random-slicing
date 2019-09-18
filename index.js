var almostEqual = require('almost-equal')

module.exports = RSlice

function RSlice (bins) {
  if (!(this instanceof RSlice)) return new RSlice(bins)
  this.bins = bins || {}
  this._binKeys = Object.keys(this.bins)
  this._totalSize = 0
  for (var i = 0; i < this._binKeys.length; i++) {
    var b = this.bins[this._binKeys[i]]
    this._totalSize += b.size
  }
}

RSlice.prototype.set = function (key, size) {
  if (this._binKeys.length === 0) {
    this.bins[key] = { size, slices: [[0,1]] }
    this._binKeys.push(key)
    this._totalSize += size
    return
  }
  var slices = []
  var gaps = []
  var newSize = this._totalSize + size
  var n = this._binKeys.length
  for (var i = 0; i < n; i++) {
    var bin = this.bins[this._binKeys[i]]
    var take = bin.size / n
    var takeFloat = take / newSize
    for (var j = 0; j < bin.slices.length; j++) {
      var prevFloatSize = length(bin.slices[j])
      var newFloatSize = prevFloatSize*this._totalSize/newSize
      var remFloatSize = prevFloatSize - newFloatSize
      var matched = false
      // first search for an exact size segment to swap out
      for (var k = 0; k < bin.slices.length; k++) {
        if (almostEqual(length(bin.slices[k]), remFloatSize)) {
          matched = true
          slices.push(bin.slices[k])
          bin.slices.splice(k,1)
          break
        }
      }
      if (matched) continue
      // otherwise keep assigning smaller intervals 
      for (var k = 0; k < bin.slices.length; k++) {
        var len = length(bin.slices[k])
        if (almostEqual(len, remFloatSize)) {
          matched = true
          slices.push(bin.slices[k])
          bin.slices.splice(k,1)
          break
        } else if (len < remFloatSize) {
          remFloatSize -= len
          slices.push(bin.slices[k])
          bin.slices.splice(k,1)
        }
      }
      if (matched) continue
      // find a suitable node to split
      for (var k = 0; k < bin.slices.length; k++) {
        // (should always be the first one)
        var iv = bin.slices[0]
        var len = length(iv)
        if (len < remFloatSize) continue
        slices.push([iv[1]-remFloatSize,iv[1]])
        iv[1] -= remFloatSize
        break
      }
    }
  }
  // sort and combine adjacent slices
  slices.sort()
  for (var i = 1; i < slices.length; i++) {
    if (adjacent(slices[i-1],slices[i])) {
      slices[i-1][1] = slices[i][1]
      slices.splice(i,1)
      i--
    }
  }
  this.bins[key] = { size, slices }
  this._binKeys.push(key)
  this._totalSize += size
}

function adjacent (g, iv) {
  if (!g) return false
  return almostEqual(g[1],iv[0]) || almostEqual(g[0],iv[1])
}

function length (iv) { return iv[1]-iv[0] }
