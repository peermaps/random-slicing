module.exports = function roundSlices (bins, n) {
  var nbins = {}
  var p = 10**n
  Object.keys(bins).forEach(function (key) {
    nbins[key] = {
      size: bins[key].size,
      slices: bins[key].slices.map(([x,y]) => {
        return [Math.round(x.toNumber()*p)/p,Math.round(y.toNumber()*p)/p]
      })
    }
  })
  return nbins
}
