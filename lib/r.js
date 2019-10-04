var lcm = require('lcm')
var gcd = require('gcd')
var BIG = Math.pow(2,24)
var SMALL = Math.pow(2,-23)

module.exports = R

function R (n, d) {
  if (!(this instanceof R)) return new R(n, d)
  this._n = n || 0
  this._d = d || 1
  if (isNaN(this._n)) throw new Error('invalid numerator: NaN')
  if (isNaN(this._d)) throw new Error('invalid denominator: NaN')
  this._big = false
  this._simplify()
}

R.prototype.copy = function () {
  return new R(this._n, this._d)
}

R.prototype.eq = function (x) {
  return this.compare(x) === 0
}

R.prototype.lte = function (x) {
  return this.compare(x) <= 0
}

R.prototype.gte = function (x) {
  return this.compare(x) >= 0
}

R.prototype.gt = function (x) {
  return this.compare(x) === 1
}

R.prototype.lt = function (x) {
  return this.compare(x) === -1
}

R.prototype.compare = function (x) {
  var n = typeof x === 'number' ? x : x._n
  var d = typeof x === 'number' ? 1 : x._d
  if (this._big || (typeof x !== 'number' && x._big)) {
    var a = this._n/this._d
    var b = n/d
    if (Math.abs(a-b) < SMALL) return 0
    return a < b ? -1 : +1
  } else {
    var m = lcm(d, this._d)
    var a = this._n*m/this._d
    var b = n*m/d
    if (a === b) return 0
    return a < b ? -1 : +1
  }
}

R.prototype.add = function (x) {
  var n = typeof x === 'number' ? x : x._n
  var d = typeof x === 'number' ? 1 : x._d
  var m = lcm(d, this._d)
  this._n = this._n*m/this._d + n*m/d
  this._d = m
  this._simplify()
  return this
}

R.prototype.subtract = function (x) {
  var n = typeof x === 'number' ? x : x._n
  var d = typeof x === 'number' ? 1 : x._d
  var m = lcm(d, this._d)
  this._n = this._n*m/this._d - n*m/d
  this._d = m
  this._simplify()
  return this
}

R.prototype.multiply = function (x) {
  var n = typeof x === 'number' ? x : x._n
  var d = typeof x === 'number' ? 1 : x._d
  this._n *= n
  this._d *= d
  this._simplify()
  return this
}

R.prototype.divide = function (x) {
  var n = typeof x === 'number' ? x : x._n
  var d = typeof x === 'number' ? 1 : x._d
  this._n *= d
  this._d *= n
  this._simplify()
  return this
}

R.prototype._simplify = function () {
  var g = gcd(Math.abs(this._n),this._d)
  this._n /= g
  this._d /= g
  if (Math.abs(this._n) > BIG || this._d > BIG) {
    this._big = true
  }
}

R.prototype.toString =
R.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
  var n = 10000
  var f = Math.round(this._n/this._d*n)/n
  return `R<${this._n}/${this._d} ~${f}>`
}

R.prototype.toNumber = function () {
  return this._n / this._d
}

function raw (x) {
  if (typeof x === 'number') return x
  return x._n
}
