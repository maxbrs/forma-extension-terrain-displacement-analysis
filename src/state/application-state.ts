import { signal } from "@preact/signals";

export type ElevationDataType = {
  array: Float32Array;
  bins: number[][];
};

export const elevation = signal<ElevationDataType | undefined>(undefined);
export const loadingData = signal<boolean>(false);
export const deltaMass = signal<number | undefined>(undefined);
