var almostEqual = require('almost-equal')

module.exports = R

function R (n) {
  if (!(this instanceof R)) return new R(n)
  this._n = n || 0
}

R.prototype.copy = function () {
  return new R(this._n)
}

R.prototype.eq = function (x) {
  return almostEqual(this._n, raw(x), almostEqual.FLT_EPSILON)
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
  if (this.eq(x)) return 0
  return this._n < raw(x) ? -1 : +1
}

R.prototype.add = function (x) {
  this._n += raw(x)
  return this
}

R.prototype.subtract = function (x) {
  this._n -= raw(x)
  return this
}

R.prototype.multiply = function (x) {
  this._n *= raw(x)
  return this
}

R.prototype.divide = function (x) {
  this._n /= raw(x)
  return this
}

R.prototype.toString =
R.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
  return `R<${this._n}>`
}

R.prototype.toNumber = function () {
  return this._n
}

function raw (x) {
  if (typeof x === 'number') return x
  return x._n
}
