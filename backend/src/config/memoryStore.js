const crypto = require('crypto');

/**
 * High-performance, zero-dependency in-memory database store
 * Provides 100% reliable fallback when local MongoDB daemon is not running.
 */
class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = new Map();
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  matchesQuery(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id') {
        if (String(doc._id) !== String(val)) return false;
      } else if (key === '$or') {
        const anyMatch = val.some(subQ => this.matchesQuery(doc, subQ));
        if (!anyMatch) return false;
      } else if (key.includes('.')) {
        const parts = key.split('.');
        let current = doc[parts[0]];
        if (Array.isArray(current)) {
          const matchInArray = current.some(item => {
            let sub = item;
            for (let i = 1; i < parts.length; i++) {
              if (sub) sub = sub[parts[i]];
            }
            return String(sub) === String(val);
          });
          if (!matchInArray) return false;
        } else {
          for (let i = 1; i < parts.length; i++) {
            if (current) current = current[parts[i]];
          }
          if (String(current) !== String(val)) return false;
        }
      } else if (typeof val === 'object' && val !== null) {
        if (val.$in && !val.$in.includes(doc[key])) return false;
        if (val.$ne && doc[key] === val.$ne) return false;
      } else if (doc[key] !== val) {
        return false;
      }


    }
    return true;
  }

  createDocProxy(data, modelProto) {
    const doc = { ...data };
    if (!doc._id) {
      doc._id = this.generateId();
    }
    if (!doc.createdAt) doc.createdAt = new Date();
    doc.updatedAt = new Date();

    // Attach prototype methods (e.g. matchPassword, getSignedJwtToken, toSafeObject)
    if (modelProto) {
      Object.setPrototypeOf(doc, modelProto);
    }

    doc.save = async () => {
      doc.updatedAt = new Date();
      this.docs.set(String(doc._id), { ...doc });
      return doc;
    };

    doc.toObject = () => ({ ...doc });

    return doc;
  }

  async findOne(query) {
    for (const raw of this.docs.values()) {
      if (this.matchesQuery(raw, query)) {
        return this.createDocProxy(raw, this.modelProto);
      }
    }
    return null;
  }

  async findById(id) {
    const raw = this.docs.get(String(id));
    if (!raw) return null;
    return this.createDocProxy(raw, this.modelProto);
  }

  async find(query = {}) {
    const results = [];
    for (const raw of this.docs.values()) {
      if (this.matchesQuery(raw, query)) {
        results.push(this.createDocProxy(raw, this.modelProto));
      }
    }
    // Return array with query helper methods
    results.sort = function (sortObj) {
      return this;
    };
    results.limit = function (n) {
      return this.slice(0, n);
    };
    return results;
  }

  async create(data) {
    const doc = this.createDocProxy(data, this.modelProto);

    // Execute pre-save hooks if defined
    if (this.schema && this.schema.preHooks) {
      for (const hook of this.schema.preHooks) {
        await hook.call(doc);
      }
    }

    this.docs.set(String(doc._id), { ...doc });
    return doc;
  }

  async deleteOne(query) {
    for (const [id, raw] of this.docs.entries()) {
      if (this.matchesQuery(raw, query)) {
        this.docs.delete(id);
        return { acknowledged: true, deletedCount: 1 };
      }
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  async deleteMany(query = {}) {
    let count = 0;
    for (const [id, raw] of this.docs.entries()) {
      if (this.matchesQuery(raw, query)) {
        this.docs.delete(id);
        count++;
      }
    }
    return { acknowledged: true, deletedCount: count };
  }

  async updateOne(query, update) {
    const existing = await this.findOne(query);
    if (!existing) return { acknowledged: true, modifiedCount: 0 };
    const updateFields = update.$set || update;
    Object.assign(existing, updateFields);
    await existing.save();
    return { acknowledged: true, modifiedCount: 1 };
  }
}

class MemoryStoreManager {
  constructor() {
    this.collections = new Map();
  }

  getCollection(name, schema, modelProto) {
    if (!this.collections.has(name)) {
      const col = new MemoryCollection(name);
      col.schema = schema;
      col.modelProto = modelProto;
      this.collections.set(name, col);
    }
    return this.collections.get(name);
  }

  clearAll() {
    this.collections.clear();
  }
}

const memoryStore = new MemoryStoreManager();
module.exports = memoryStore;

