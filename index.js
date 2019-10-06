var rat = require('bigint-rational')
var ZERO = [0n,1n]
var r0 = [0n,1n]
var r1 = [0n,1n]
var r2 = [0n,1n]

module.exports = RSlice

function RSlice (bins) {
  var self = this
  if (!(self instanceof RSlice)) return new RSlice(bins)
  self._bins = {}
  if (bins) {
    Object.keys(bins).forEach(function (key) {
      self._bins[key] = {
        size: bins[key].size,
        slices: bins[key].slices.map(function (iv) {
          var start = [toBig(iv[0][0]),toBig(iv[0][1])]
          var end = [toBig(iv[1][0]),toBig(iv[1][1])]
          return [start,end]
        })
      }
    })
  }
  self._totalSize = 0
  self._binKeys = Object.keys(self._bins).sort()
  self._binKeys.forEach(function (key) {
    self._totalSize += self._bins[key].size
  })
}

RSlice.prototype.getBins = function () {
  return this._bins
}

RSlice.parse = function (str) {
  return new RSlice(JSON.parse(str))
}

RSlice.prototype.serialize = function () {
  var self = this
  var bins = {}
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var bin = self._bins[key]
    bins[key] = {
      size: bin.size,
      slices: bin.slices.map(function (slice) {
        return [
          [slice[0][0].toString(),slice[0][1].toString()],
          [slice[1][0].toString(),slice[1][1].toString()]
        ]
      })
    }
  }
  return JSON.stringify(bins)
}

RSlice.prototype.set = function (updates) {
  var self = this
  var newSize = self._totalSize
  Object.keys(updates).forEach(function (key) {
    var bin = self._bins[key]
    newSize += updates[key] - (bin ? bin.size : 0)
  })
  if (self._binKeys.length === 0) {
    var offset = [0n,1n]
    Object.keys(updates).forEach(function (key) {
      var iv = [
        rat.copy([],offset),
        rat.create(updates[key],newSize)
      ]
      rat.add(iv[1], offset, iv[1])
      rat.copy(offset, iv[1])
      rat.reduce(iv[0], iv[0])
      rat.reduce(iv[1], iv[1])
      self._bins[key] = { size: updates[key], slices: [iv] }
      self._binKeys.push(key)
      self._totalSize += updates[key]
    })
    self._binKeys.sort()
    return
  }
  var addedKey = false
  Object.keys(updates).forEach(function (key) {
    if (!self._bins[key]) {
      self._bins[key] = { size: 0, slices: [] }
      self._binKeys.push(key)
      addedKey = true
    }
  })
  if (addedKey) self._binKeys.sort()

  // first phase: shrink intervals by removing gaps
  var gaps = []
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var bin = self._bins[key]
    var newBinSize = updates.hasOwnProperty(key) ? updates[key] : bin.size
    var newRatio = rat.set(r0, newBinSize, newSize)
    var ratio = sliceSum(r1, bin.slices)
    var delta = rat.subtract(r2, ratio, newRatio) // amount to shrink
    if (rat.lte(delta,ZERO)) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(r0, iv)
      if (!rat.eq(len, delta)) continue
      gaps.push(iv)
      bin.slices.splice(j,1)
      matched = true
      break
    }
    if (matched) continue
    // assign smaller intervals to gaps
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(r0, iv)
      if (rat.gt(len,delta)) continue
      gaps.push(iv)
      bin.slices.splice(j,1)
      j--
      rat.subtract(delta, delta, len)
      if (rat.eq(delta,ZERO)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable node to split
    for (var j = 0; j < bin.slices.length; j++) {
      var iv = bin.slices[j]
      var len = length(r0, iv)
      if (rat.lt(len,delta)) continue
      if (rat.eq(len,delta)) {
        gaps.push(iv)
        bin.slices.splice(j,1)
        matched = true
        break
      }
      gaps.push([
        rat.subtract([0n,1n],iv[1],delta),
        rat.copy([0n,1n],iv[1])
      ])
      rat.subtract(iv[1], iv[1], delta)
      matched = true
      break
    }
    if (matched) continue
    throw new Error('not matched: ' + key + ': ' + newBinSize)
  }
  // second phase: assign gaps to intervals that need to grow
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var bin = self._bins[key]
    var newBinSize = updates.hasOwnProperty(key) ? updates[key] : bin.size
    var newRatio = rat.set(r0, newBinSize, newSize)
    var ratio = sliceSum(r1, bin.slices)
    var delta = rat.subtract(r2, newRatio, ratio) // amount to grow
    if (rat.lte(delta,ZERO)) continue
    var matched = false
    // first search for exact matches
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(r0, iv)
      if (!rat.eq(delta,len)) continue
      bin.slices.push(iv)
      gaps.splice(j,1)
      matched = true
      break
    }
    if (matched) continue
    // assign smaller gaps
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(r0, iv)
      if (rat.gt(len,delta)) continue
      bin.slices.push(iv)
      gaps.splice(j,1)
      j--
      rat.subtract(delta,delta,len)
      if (rat.eq(delta,ZERO)) {
        matched = true
        break
      }
    }
    if (matched) continue
    // find a suitable gap to split
    for (var j = 0; j < gaps.length; j++) {
      var iv = gaps[j]
      var len = length(r0, iv)
      if (rat.eq(len,delta)) {
        bin.slices.push(iv)
        gaps.splice(j,1)
        matched = true
        break
      } else if (rat.lt(len,delta)) continue
      bin.slices.push([
        rat.subtract([0n,1n],iv[1],delta),
        rat.copy([0n,1n],iv[1])
      ])
      rat.subtract(iv[1],iv[1],delta)
      matched = true
      break
    }
    if (matched) continue
    if (rat.eq(delta,ZERO)) continue
    throw new Error('not matched: ' + key + ': ' + newBinSize)
  }
  if (gaps.length > 0) throw new Error('gaps remain: ' + displayGaps(gaps))
  // ---
  for (var i = 0; i < self._binKeys.length; i++) {
    var key = self._binKeys[i]
    var b = self._bins[key]
    if (updates.hasOwnProperty(key)) {
      b.size = updates[key]
    }
    if (b.size === 0) {
      delete self._bins[self._binKeys[i]]
      self._binKeys.splice(i,1)
      i--
    } else cleanup(b)
  }
  self._totalSize = newSize
}

function sliceSum (out, slices) {
  rat.set(out, 0n, 1n)
  for (var i = 0; i < slices.length; i++) {
    rat.add(out, out, slices[i][1])
    rat.subtract(out, out, slices[i][0])
  }
  return out
}

function cleanup (dst) {
  // reduce, sort, remove 0-width, and combine adjacent slices
  for (var i = 0; i < dst.slices.length; i++) {
    var iv = dst.slices[i]
    rat.reduce(iv[0], iv[0])
    rat.reduce(iv[1], iv[1])
  }
  dst.slices.sort(cmpIv)
  for (var i = 0; i < dst.slices.length; i++) {
    if (rat.eq(length(r0, dst.slices[i]),ZERO)) {
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
  return rat.eq(g[1],iv[0]) || rat.eq(g[0],iv[1])
}
function length (out, iv) {
  return rat.subtract(out, iv[1], iv[0])
}
function cmpIv (a, b) {
  return rat.eq(a[0],b[0]) ? rat.compare(a[1],b[1]) : rat.compare(a[0],b[0])
}

function displayGaps (gaps) {
  return '[' + gaps.map(function (g) {
    return '(' + g[0] + '..' + g[1] + ')'
  }).join(', ') + ']'
}

function toBig (x) {
  if (typeof x === 'string') {
    return BigInt(x)
  } else if (typeof x === 'bigint') {
    return x
  } else {
    throw new Error('unexpected interval start type ' + typeof x)
  }
}
