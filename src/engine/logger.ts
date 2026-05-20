enum Level {
  NONE,
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

interface ConsoleHandler {
  (...args: unknown[]): void;
}

interface ILogHandler {
  (title: string, ...args: unknown[]): void;
}

interface ILogContainer {
  D: ILogHandler;
  I: ILogHandler;
  W: ILogHandler;
  E: ILogHandler;
}

const LOG_MAPPER: {
  [Level.ERROR]: ConsoleHandler;
  [Level.WARN]: ConsoleHandler;
  [Level.INFO]: ConsoleHandler;
  [Level.DEBUG]: ConsoleHandler;
} = {
  [Level.ERROR]: console.error,
  [Level.WARN]: console.warn,
  [Level.INFO]: console.info,
  [Level.DEBUG]: console.debug,
} as const;

const LOG_COLOR: {
  [Level.ERROR]: string;
  [Level.WARN]: string;
  [Level.INFO]: string;
  [Level.DEBUG]: string;
} = {
  [Level.DEBUG]: '#888888', // 灰色
  [Level.INFO]: '#4CAF50', // 绿色
  [Level.WARN]: '#FF9800', // 橙色
  [Level.ERROR]: '#F44336', // 红色
} as const;

class Logger {
  private static _level: Level = Level.DEBUG;
  private static _items: Map<string, ILogContainer> = new Map();

  private static _handle(tag: string, target: Level) {
    const that = this;
    return function (title: string, ...args: unknown[]) {
      const curr = that._level;
      if (curr === Level.NONE) return;
      if (curr < target) return;
      // @ts-ignore
      const output = LOG_MAPPER[target];
      const date = new Date();
      const timestamp = `${date.toLocaleTimeString()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
      const header = `[${tag}|${Level[target]}|${timestamp}]`;
      output(`%c${header} %c${title}`, `color: ${LOG_COLOR[curr]}; font-weight: bold`, '', ...args);
    };
  }

  public static get Level() {
    return this._level;
  }

  public static set Level(level: Level) {
    this._level = level;
  }

  public static get Sys() {
    return this.Acquire('sys');
  }

  public static Acquire(tag: string) {
    if (!this._items.has(tag)) {
      this._items.set(tag, {
        D: this._handle(tag, Level.DEBUG),
        I: this._handle(tag, Level.INFO),
        W: this._handle(tag, Level.WARN),
        E: this._handle(tag, Level.ERROR),
      });
    }
    return this._items.get(tag);
  }
}

export { Logger, Level as LoggerLevel };
