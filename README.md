# neg lru cache

A simple cache object that deletes the least-recently-used items. 

Fork from: [node-lru-cache](https://github.com/isaacs/node-lru-cache)

## Installation: 

```javascript
npm install neg-lru-cache --save
```

## Usage:

```javascript
var LRU = require("lru-cache")
  , options = { max: 500
              , ttl: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
cache.get("key") // "value"

cache.set("key2", "value2", 1000 × 10) //individual ttl

// non-string keys ARE fully supported
var someObject = {}
cache.set(someObject, 'a value')
cache.set('[object Object]', 'a different value')
assert.equal(cache.get(someObject), 'a value')

cache.reset()    // empty the cache
```

If you put more stuff in it, then items will fall out.

If you try to put an oversized thing in it, then it'll fall out right
away.

## Options

* `max` The maximum size of the cache, checked by applying the length
  function to all values in the cache.  Not setting this is kind of
  silly, since that's the whole purpose of this lib, but it defaults
  to `Infinity`.
* `ttl` time to alive in ms. If you try to get an item that is too old, it'll
  drop it and return undefined instead of giving it to you.

## API

* `set(key, value, ttl)`
* `get(key) => value`

    Both of these will update the "recently used"-ness of the key.
    They do what you think. `ttl` is optional and overrides the
    cache `ttl` option if provided.

    If the key is not found, `get()` will return `undefined`.

    The key and val can be any value.

* `del(key)`

    Deletes a key out of the cache.

* `reset()`

    Clear the cache entirely, throwing away all values.

* `has(key)`

    Check if a key is in the cache, without updating the recent-ness
    or deleting it for being stale.

* `forEach(function(value,key,cache), [thisp])`

    Just like `Array.prototype.forEach`.  Iterates over all the keys
    in the cache, in order of recent-ness.  (Ie, more recently used
    items are iterated over first.)

* `rforEach(function(value,key,cache), [thisp])`

    The same as `cache.forEach(...)` but items are iterated over in
    reverse order.  (ie, less recently used items are iterated over
    first.)

* `keys()`

    Return an array of the keys in the cache.

* `values()`

    Return an array of the values in the cache.

* `count()`

    Return total quantity of objects currently in cache. Note, that
    `stale` (see options) items are returned as part of this item
    count.