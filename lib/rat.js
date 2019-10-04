exports.create = function create (n, d) {
  var bn = typeof n === 'bigint' ? n : BigInt(n)
  var bd = typeof d === 'bigint' ? d : BigInt(d)
  if (bd <= 0) throw new Error('invalid denominator: ' + d)
  return [bn,bd]
}

exports.clone = function clone (x) {
  return [x[0],x[1]]
}

exports.copy = function (out, x) {
  out[0] = x[0]
  out[1] = x[1]
  return out
}

exports.set = function set (out, x, y) {
  var n = typeof x === 'bigint' ? x : BigInt(x)
  var d = typeof y === 'bigint' ? y : BigInt(y)
  if (d <= 0n) throw new Error('invalid denominator: ' + d)
  out[0] = n
  out[1] = d
  return out
}

exports.eq = function eq (a, b) {
  return compare(a,b) === 0
}

exports.lt = function lt (a, b) {
  return compare(a,b) < 0
}

exports.lte = function lte (a, b) {
  return compare(a,b) <= 0
}

exports.gt = function gt (a, b) {
  return compare(a,b) > 0
}

exports.gte = function gte (a, b) {
  return compare(a,b) >= 0
}

exports.compare = compare
function compare (a, b) {
  var m = lcm(a[1],b[1])
  var ma = a[0] * m / a[1]
  var mb = b[0] * m / b[1]
  if (ma === mb) return 0
  return ma < mb ? -1 : +1
}

exports.add = function add (out, a, b) {
  var m = lcm(a[1],b[1])
  out[0] = a[0] * m / a[1] + b[0] * m / b[1]
  out[1] = m
  return out
}

exports.subtract = function subtract (out, a, b) {
  var m = lcm(a[1],b[1])
  out[0] = a[0] * m / a[1] - b[0] * m / b[1]
  out[1] = m
  return out
}

exports.multiply = function multiply (out, a, b) {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  return out
}

exports.divide = function divide (out, a, b) {
  var b0 = b[0], b1 = b[1]
  out[0] = a[0] * b1
  out[1] = a[1] * b0
  return out
}

exports.abs = function abs (out, x) {
  out[0] = bnAbs(x[0])
  out[1] = bnAbs(x[1])
  return out
}

exports.simplify = function simplify (out, x) {
  var g = gcd(bnAbs(x[0]),x[1])
  out[0] = x[0] / g
  out[1] = x[1] / g
  return out
}

exports.isValid = function valid (x) {
  if (typeof x[0] !== 'bigint') return false
  if (typeof x[1] !== 'bigint') return false
  if (x[1] <= 0n) return false
  return true
}

function bnAbs (x) { return x < 0n ? -x : x }

function gcd (a, b) {
  if (b === 0n) return a
  return gcd(b, a % b)
}

function lcm (a, b) {
  if (b === 0n) return 0n
  return a * b / gcd(a, b)
}
