function generator() {
  let n = 0;
  return function next() {
    return ++n;
  };
}

export { generator };
