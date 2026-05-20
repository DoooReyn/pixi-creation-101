interface IEventPair {
  add(): void;
  remove(): void;
}

function EventPair(event: string, fn: Function, context: unknown): IEventPair {
  const handler = fn.bind(context);
  function add() {
    remove();
    globalThis.addEventListener(event, handler);
  }
  function remove() {
    globalThis.removeEventListener(event, handler);
  }
  return { add, remove };
}

export { type IEventPair, EventPair };
