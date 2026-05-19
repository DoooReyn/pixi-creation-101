type PluginConstructor<P extends Plugin> = {
  readonly Trait: string;
  new (): P;
};

abstract class Plugin<R extends {} = {}> {
  declare public readonly trait: string;
  private _initPromise: Promise<void>;
  private _inited: boolean;
  private _destroyed: boolean;

  public constructor() {
    this._initPromise = null;
    this._inited = false;
    this._destroyed = false;
  }

  public async init(options?: Partial<R>): Promise<void> {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this.doInit(options);
    await this._initPromise;
    this._inited = true;
    this._initPromise = null;
  }

  public destroy() {
    if (this._destroyed) return;
    this.doDestroy();
    this._destroyed = true;
  }

  public get inited() {
    return this._inited;
  }

  public destroyed() {
    return this._destroyed;
  }

  protected abstract doInit(options?: Partial<R>): Promise<void>;
  protected abstract doDestroy(): void;
}

function plugin(trait: string) {
  return function (ctor: any) {
    ctor.Trait = trait;
    ctor.prototype.trait = trait;
  };
}

export { Plugin, type PluginConstructor, plugin };
