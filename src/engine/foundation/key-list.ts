class KeyList<Item = any> {
  private _map: Map<string, Item>;
  private _key: string[];

  public constructor() {
    this._map = new Map();
    this._key = [];
  }

  public get size() {
    return this._map.size;
  }

  // -------------------- 数组 --------------------

  public at(index: number) {
    const size = this.size;
    if (size <= 0 || index >= size) return undefined;
    return this._map.get(this._key[index]);
  }

  public first() {
    return this.at(0);
  }

  public last() {
    return this.at(this.size - 1);
  }

  public indexOf(key: string) {
    return this._key.indexOf(key);
  }

  public pop() {
    if (this.size > 0) {
      const key = this._key.pop();
      const item = this._map.get(key);
      this._map.delete(key);
      return item;
    }
    return undefined;
  }

  // -------------------- 映射 --------------------
  public has(key: string) {
    return this._map.has(key);
  }

  public get(key: string) {
    return this._map.get(key);
  }

  public set(key: string, val: Item) {
    if (!this.has(key)) {
      this._key.push(key);
    }
    this._map.set(key, val);
  }

  public delete(key: string) {
    if (this.has(key)) {
      this._map.delete(key);
      this._key.splice(this._key.indexOf(key), 1);
      return true;
    }
    return false;
  }

  public clear() {
    this._map.clear();
    this._key.length = 0;
  }
}

export { KeyList };
