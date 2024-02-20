export function* cartesian<T extends unknown[]>(
  ...a: { [K in keyof T]: readonly T[K][] }
): Generator<T> {
  if (a.length === 0) {
    yield [] as unknown as T;
  } else {
    const [head, ...tail] = a;
    for (const h of head) {
      for (const t of cartesian(...tail)) {
        yield [h, ...t] as T;
      }
    }
  }
}
