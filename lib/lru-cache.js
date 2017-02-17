'use strict'

// A linked list to keep track of recently-used-ness
const Yallist = require('yallist')

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor(options) {
    if (!(this instanceof LRUCache)) {
      return new LRUCache(options)
    }
    if (typeof options === 'number') {
      options = { max: options }
    }
    options = options || {}
    var max = this.max = options.max
    if (!max || !(typeof max === 'number') || max <= 0) {
      this.max = Infinity
    }
    this.ttl = options.ttl || 0
    this.reset()
  }

  reset() {
    this.cache = new Map() // hash of items by key
    this.lruList = new Yallist() // list of items in order of use recency
  }

  count() {
    return this.lruList.length
  }

  rforEach(fn, thisp) {
    thisp = thisp || this
    for (var walker = this.lruList.tail; walker !== null;) {
      var prev = walker.prev
      this.forEachStep(fn, walker, thisp)
      walker = prev
    }
  }

  forEach(fn, thisp) {
    thisp = thisp || this
    for (var walker = this.lruList.head; walker !== null;) {
      var next = walker.next
      this.forEachStep(fn, walker, thisp)
      walker = next
    }
  }

  forEachStep(fn, node, thisp) {
    var hit = node.value
    if (this.isStale(hit)) {
      this.del(node)
      hit = undefined
    }
    if (hit) {
      fn.call(thisp, hit.value, hit.key, this)
    }
  }

  keys() {
    return this.lruList.toArray().map((k) => k.key, this)
  }

  values() {
    return this.lruList.toArray().map((k) => k.value, this)
  }


  set(key, value, ttl) {
    ttl = ttl || this.ttl
    var now = ttl ? Date.now() : 0

    if (this.cache.has(key)) {
      var item = this.cache.get(key).value
      item.now = now
      item.ttl = ttl
      item.value = value
      this.get(key)
      this.trim()
      return true
    }

    var hit = new Entry(key, value, now, ttl)
    this.lruList.unshift(hit)
    this.cache.set(key, this.lruList.head)
    this.trim()
    return true
  }

  has(key) {
    if (!this.cache.has(key)) {
      return false
    }
    var hit = this.cache.get(key)
    if (this.isStale(hit.value)) {
      return false
    }
    return true
  }

  get(key) {
    var node = this.cache.get(key)
    if (node) {
      var hit = node.value
      if (this.isStale(hit)) {
        this.del(hit.key)
        hit = undefined
      } else {
        this.lruList.unshiftNode(node)
      }
      if(hit){
        hit = hit.value
      }
    }
    return hit
  }

  del(key) {
    var node = this.cache.get(key)
    if (node) {
      this.cache.delete(key)
      this.lruList.removeNode(node)
    }
  }

  isStale(hit) {
    if (!hit || (!hit.ttl && !this.ttl)) {
      return false
    }
    var stale = false
    var diff = Date.now() - hit.now
    if (hit.ttl) {
      stale = diff > hit.ttl
    } else {
      stale = this.ttl && (diff > this.ttl)
    }
    return stale
  }

  trim() {
    if (this.count() > this.max) {
      for (var walker = this.lruList.tail; this.count() > this.max && walker !== null;) {
        var prev = walker.prev
        this.del(walker.value.key)
        walker = prev
      }
    }
  }
}

class Entry {
  constructor(key, value, now, ttl) {
    this.key = key
    this.value = value
    this.now = now
    this.ttl = ttl || 0
  }
}

module.exports = LRUCache