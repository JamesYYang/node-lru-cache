//mocha unit test

var assert = require('assert');
var LRU = require('../')


it('basic get and set without ttl', function () {
  var cache = new LRU({ max: 10 })
  cache.set('key', 'value')
  assert.equal(cache.get('key'), 'value')
  assert.equal(cache.get('key'), 'value')
  assert.equal(cache.get('nada'), undefined)
})


it('least recently set', function () {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.set('c', 'C')
  assert.equal(cache.get('c'), 'C')
  assert.equal(cache.get('b'), 'B')
  assert.equal(cache.get('a'), undefined)
})

it('lru recently gotten', function () {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.get('a')
  cache.set('c', 'C')
  assert.equal(cache.get('c'), 'C')
  assert.equal(cache.get('b'), undefined)
  assert.equal(cache.get('a'), 'A')
})

it('del', function () {
  var cache = new LRU(2)
  cache.set('a', 'A')
  cache.del('a')
  assert.equal(cache.get('a'), undefined)
})

it('reset', function () {
  var cache = new LRU(10)
  cache.set('a', 'A')
  cache.set('b', 'B')
  cache.reset()
  assert.equal(cache.count(), 0)
  assert.equal(cache.max, 10)
  assert.equal(cache.get('a'), undefined)
  assert.equal(cache.get('b'), undefined)
})

it('drop the old items', function (done) {
  var cache = new LRU({
    max: 5,
    ttl: 50
  })

  cache.set('a', 'A')

  setTimeout(function () {
    cache.set('b', 'b')
    assert.equal(cache.get('a'), 'A')
  }, 25)

  setTimeout(function () {
    cache.set('c', 'C')
    assert.equal(cache.get('a'), undefined)
  }, 60 + 25)

  setTimeout(function () {
    assert.equal(cache.get('b'), undefined)
    assert.equal(cache.get('c'), 'C')
  }, 90)

  setTimeout(function () {
    assert.equal(cache.get('c'), undefined)
    done()
  }, 155)
})

it('individual item can have its own maxAge', function (done) {
  var cache = new LRU({
    max: 5,
    ttl: 50
  })

  cache.set('a', 'A', 20)
  setTimeout(function () {
    assert.equal(cache.get('a'), undefined)
    done()
  }, 25)
})

it('individual item can have its own ttl > cache', function (done) {
  var cache = new LRU({
    max: 5,
    ttl: 20
  })

  cache.set('a', 'A', 50)
  setTimeout(function () {
    assert.equal(cache.get('a'), 'A')
    done()
  }, 25)
})

it('has()', function (done) {
  var cache = new LRU({
    max: 1,
    ttl: 10
  })

  cache.set('foo', 'bar')
  assert.equal(cache.has('foo'), true)
  cache.set('blu', 'baz')
  assert.equal(cache.has('foo'), false)
  assert.equal(cache.has('blu'), true)
  setTimeout(function () {
    assert.equal(cache.has('blu'), false)
    done()
  }, 15)
})

it('lru update via set', function () {
  var cache = new LRU({ max: 2 })

  cache.set('foo', 1)
  cache.set('bar', 2)
  cache.del('bar')
  cache.set('baz', 3)
  cache.set('qux', 4)

  assert.equal(cache.get('foo'), undefined)
  assert.equal(cache.get('bar'), undefined)
  assert.equal(cache.get('baz'), 3)
  assert.equal(cache.get('qux'), 4)
})

it('get and set using object', function () {
  var cache = new LRU()
  var obj = {}
  cache.set(obj, 'value')

  assert.equal(cache.get(obj), 'value')
})

it('delete non-existent item has no effect', function () {
  var l = new LRU({ max: 2 })
  l.set('foo', 1)
  l.set('bar', 2)
  l.del('baz')
  assert.deepEqual(l.keys(), [ 'bar', 'foo' ])
  assert.deepEqual(l.values(), [ 2, 1 ])
})