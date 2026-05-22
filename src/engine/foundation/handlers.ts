import { Logger } from '../logger';

interface Handler {
  handle: (...args: unknown[]) => void;
  context?: unknown;
  once?: boolean;
  args?: unknown[];
}

class Handlers {
  public static Create(
    handle: Handler['handle'],
    context?: Handler['context'],
    once?: boolean,
    args?: Handler['args']
  ) {
    return {
      handle,
      context,
      once,
      args,
    };
  }

  public static Run(handler: Handler) {
    const wrapper: Handler & { _count?: number } = handler;
    wrapper._count ??= 0;

    if (wrapper.once && wrapper._count > 0) return;
    wrapper._count++;

    const { handle, context, args } = handler;
    try {
      if (context !== undefined) {
        handle.apply(context, args);
      } else {
        handle(...args);
      }
    } catch (e) {
      Logger.Sys.E('句柄运行时错误:', e);
    }
  }
}

export { type Handler, Handlers };
