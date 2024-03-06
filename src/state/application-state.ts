import { signal } from "@preact/signals";

export type Settings = {
  otherTerrainUrn: string;
};

export type ElevationDataType = {
  array: Float32Array;
  bins: number[][];
};

const APP_VERSION = "0.0";
const APP_NAME = "MDA";

export const EXTENSION_KEY = `Forma-ext-${APP_NAME}-v${APP_VERSION}`;
export const DEFAULT_SETTINGS: Settings = {
  otherTerrainUrn: "",
};
export const TERRAIN_BUFFER = 50;
// const RAPID_RAYCAST_THRESHOLD = 250;

export const initialized = signal<boolean>(false);
export const projectSettings = signal<Settings | undefined>(undefined);
export const helpDismissed = signal<boolean>(false);
// export const selectedSiteLimits = signal<string[]>([]);
// export const useRapidRayCast = signal<boolean>(true);
export const inputScale = signal<number>(2);
export const elevation = signal<ElevationDataType | undefined>(undefined);
export const loadingData = signal<boolean>(false);
export const deltaMass = signal<number | undefined>(undefined);
