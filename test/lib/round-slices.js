module.exports = function roundSlices (rs, n) {
  var nbins = {}
  var p = 10**n
  var bins = rs.getBins()
  Object.keys(bins).forEach(function (key) {
    nbins[key] = {
      size: bins[key].size,
      slices: bins[key].slices.map(([[xn,xd],[yn,yd]]) => {
        return [
          Math.round(Number(xn)*p/Number(xd))/p,
          Math.round(Number(yn)*p/Number(yd))/p
        ]
      })
    }
  })
  return nbins
}
