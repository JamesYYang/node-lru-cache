//mocha unit test

var assert = require('assert');
var LRU = require('../')

it('forEach', function () {
  var l = new LRU(5)
  var i
  for (i = 0; i < 10; i++) {
    l.set(i, i.toString(2))
  }

  i = 9
  l.forEach(function (val, key, cache) {
    assert.equal(cache, l)
    assert.equal(key, i)
    assert.equal(val, i.toString(2))
    i -= 1
  })

  // get in order of most recently used
  l.get(6)
  l.get(8)

  var order = [ 8, 6, 9, 7, 5 ]
  i = 0

  l.forEach(function (val, key, cache) {
    var j = order[i++]
    assert.equal(cache, l)
    assert.equal(key, j)
    assert.equal(val, j.toString(2))
  })
  assert.equal(i, order.length)

  i = 0
  order.reverse()
  l.rforEach(function (val, key, cache) {
    var j = order[i++]
    assert.equal(cache, l)
    assert.equal(key, j)
    assert.equal(val, j.toString(2))
  })

  assert.equal(i, order.length)
})

it('all entries are iterated over', function () {
  var l = new LRU(5)
  var i
  for (i = 0; i < 10; i++) {
    l.set(i.toString(), i.toString(2))
  }

  i = 0
  l.forEach(function (val, key, cache) {
    if (i > 0) {
      cache.del(key)
    }
    i += 1
  })

  assert.equal(i, 5)
  assert.equal(l.keys().length, 1)

})

it('expires', function (done) {
  var l = new LRU({
    max: 10,
    ttl: 50
  })
  var i
  for (i = 0; i < 10; i++) {
    l.set(i.toString(), i.toString(2), ((i % 2) ? 25 : undefined))
  }

  i = 0
  var order = [ 8, 6, 4, 2, 0 ]
  setTimeout(function () {
    l.forEach(function (val, key, cache) {
      var j = order[i++]
      assert.equal(cache, l)
      assert.equal(key, j.toString())
      assert.equal(val, j.toString(2))
    })
    assert.equal(i, order.length)

    setTimeout(function () {
      var count = 0
      l.forEach(function (val, key, cache) { count++ })
      assert.equal(0, count)
      done()
    }, 25)
  }, 26)
})
