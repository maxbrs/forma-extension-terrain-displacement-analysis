import { signal } from "@preact/signals";
import { Settings } from "../components/subComponents/InputURN.tsx";

export type ElevationDataType = {
  array: Float32Array;
  bins: number[][];
};

export const DEFAULT_SETTINGS: Settings = {
  oldTerrainUrn: "",
  newTerrainUrn: "",
};

export const projectSettings = signal<Settings | undefined>(undefined);
// export const selectedSiteLimits = signal<string[]>([]);
// export const useRapidRayCast = signal<boolean>(true);
export const inputScale = signal<number>(2);
export const elevation = signal<ElevationDataType | undefined>(undefined);
export const loadingData = signal<boolean>(false);
export const deltaMass = signal<number | undefined>(undefined);
