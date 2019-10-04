var Rat = require('big-rat')
var cmp = require('big-rat/cmp')
var add = require('big-rat/add')
var sub = require('big-rat/sub')
var mul = require('big-rat/mul')
var div = require('big-rat/div')

module.exports = R

function R (n, d) {
  if (!(this instanceof R)) return new R(n, d)
  this._r = Rat(n, d)
}

R.prototype.copy = function () {
  return new R(this._r)
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
  return cmp(this._r, x._r)
}

R.prototype.add = function (x) {
  this._r = add(this._r, x._r)
  return this
}

R.prototype.subtract = function (x) {
  this._r = sub(this._r, x._r)
  return this
}

R.prototype.multiply = function (x) {
  this._r = mul(this._r, x._r)
  return this
}

R.prototype.divide = function (x) {
  this._r = div(this._r, x._r)
  return this
}

R.prototype.toString =
R.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
  var n = 10000
  var f = Math.round(Number(this._r[0].toString())*n
    / Number(this._r[1].toString()))/n
  return `R<${this._r[0].toString()}/${this._r[1].toString()} ~${f}>`
}

R.prototype.toNumber = function () {
  return Number(this._r[0].toString()) / Number(this._r[1].toString())
}

R.prototype.asTuple = function () {
  return [this._r[0].toString(),this._r[1].toString()]
}
