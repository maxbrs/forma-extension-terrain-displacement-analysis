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

export function formatBigNumber(num: number): string {
  const absNum = Math.abs(num)
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else {
    return num.toString();
  }
}
