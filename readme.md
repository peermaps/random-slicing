# random-slicing

resizable hashing strategy for large-scale storage

implements the algorithm from the [random slicing paper][paper],
a better alternative to the [hash ring technique used in riak][riak-critique]

The random slicing algorithm is designed to maintain a resizable address space
across storage nodes while minimizing the amount of data that needs to be moved
during a resize operation on the address space.

The address space exists on a real number line from 0 to 1. Each bin is granted
slices on this number line based on its size. These allotments may change over
the course of the program, but the algorithm will minimize the change in slices
for each bin while preserving the size ratios.

This implementation internally uses arbitrary-precision rationals for slicing
calculations to eliminate rounding errors as the system evolves over time.
Consult the hash example for how to convert these rationals into the hash space
of your chosen hashing algorithm.

[paper]: ftp://ftp.cse.ucsc.edu/pub/darrell/miranda-tos14.pdf
[riak-critique]: https://mobilemonitoringsolutions.com/article-a-critique-of-resizable-hash-tables-riak-core-random-slicing/

# example

In this example, we initialize a previous allocation for nodes A (size 40) and B
(size 120). In practice you might get this previous allocation from persistent
storage or the network.

Then, we shrink A from 40 to 32 and add a new node C with size 80.

Finally we display the integer ratios for each slicing interval.

``` js
var RS = require('random-slicing')
var rs = new RS
rs.set({ A: 40, B: 120 })
rs.set({ A: 32, C: 80 })

Object.entries(rs.getBins()).forEach(function ([key,bin]) {
  console.log(key, bin.size, bin.slices.map(showSlice).join(', '))
})

function showSlice ([start,end]) {
  return `${start[0]}/${start[1]}..${end[0]}/${end[1]}`
}
```

which prints:

```
A 32 0/1..640/4640
B 120 40/160..3560/4640
C 80 640/4640..40/160, 3560/4640..160/160
```

# api

```
var RS = require('random-slicing')
```

## var rs = new RS(bins)

Initialize a new random slicing with an optional allocation of `bins`.

`bins` should be of the format returned by `rs.getBins()` documented below.

## rs.set(updates)

Set the new sizes with an object `updates` mapping keys to their new sizes. Keys
not present in `updates` will keep the same size.

To delete a bin, set its size to `0`.

## var bins = rs.getBins()

Return the collection of allocated `bins`, an object that maps bin names to
bins, where each `bin` has:

* `bin.size` - presently allocated size
* `bin.slices` - array of intervals

Each interval is an array 2-tuple `[start,end]` and `start` and `end` are each
array 2-tuples of the form `[numerator,denominator]` where `numerator` and
denominator are both built-in bigints.

For example, a `bin` might look like:

``` js
{
  size: 10,
  slices: [[[0n,1n],[1n,7n]],[[87n,364n],[1n,4n]]]
}
```

which contains slices from 0 to 1/7 and from 87/364 to 1/4.

## var str = rs.serialize()

Serialize an `rs` instance to a string.

## var rs = RS.parse(str)

Create a new `rs` instance from a previously serialized string `str`.

# license

[license zero parity](https://licensezero.com/licenses/parity)
and [apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
(contributions)
