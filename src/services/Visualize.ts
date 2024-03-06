import {
  deltaMass,
  elevation,
  inputScale,
  loadingData,
} from "../state/application-state.ts";

export const colors = [
  "rgba(0, 255, 0, 1)",
  "rgba(79, 255, 59, 1)",
  "rgba(112, 255, 87, 1)",
  "rgba(137, 255, 111, 1)",
  "rgba(158, 255, 133, 1)",
  "rgba(177, 255, 154, 1)",
  "rgba(195, 255, 175, 1)",
  "rgba(211, 255, 195, 1)",
  "rgba(226, 255, 215, 1)",
  "rgba(241, 255, 235, 1)",
  "rgba(255, 255, 255, 1)",
  "rgba(255, 236, 229, 1)",
  "rgba(255, 217, 203, 1)",
  "rgba(255, 198, 178, 1)",
  "rgba(255, 178, 153, 1)",
  "rgba(255, 158, 129, 1)",
  "rgba(255, 137, 105, 1)",
  "rgba(255, 115, 82, 1)",
  "rgba(255, 91, 58, 1)",
  "rgba(255, 62, 34, 1)",
  "rgba(255, 0, 0, 1)",
];

function getBins(nbBins: number, range: [number, number]): number[][] {
  const binSize = (range[1] - range[0]) / nbBins;

  const bins = [];
  for (let i = 0; i < nbBins - 1; i += 1) {
    bins.push([i * binSize + range[0], (i + 1) * binSize + range[0]]);
  }
  bins.push([(nbBins - 1) * binSize + range[0], range[1] + 1]);
  return bins;
}

function findIndexFromBin(value: number, bins: number[][]): number {
  return bins.findIndex(([min, max]) => min <= value && value < max);
}

export function initializeBlankCanvas(): HTMLCanvasElement {
  return document.createElement("canvas");
}

export function createCanvas(
  array: Float32Array,
  width: number,
  height: number,
  minElevation: number,
  maxElevation: number,
): HTMLCanvasElement {
  const canvas = initializeBlankCanvas();
  canvas.width = width;
  canvas.height = height;

  if (minElevation === maxElevation || maxElevation - minElevation < 0.5) {
    // if the min and max elevation are the same, the canvas will be all white
    return canvas;
  }

  const ctx = canvas.getContext("2d");
  // const colorGrading = threshold / colors.length;
  const highestDiff = Math.max(
    0,
    Math.abs(minElevation),
    Math.abs(maxElevation),
  );

  const bins = getBins(colors.length, [-highestDiff, highestDiff]);
  for (let i = 0; i < array.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);
    const idx = findIndexFromBin(array[i], bins);
    ctx!.fillStyle = colors[idx];
    ctx!.fillRect(x, height - y, 1, 1);
  }

  const elevationArray = array.filter((v) => !isNaN(v));
  elevation.value = { array: elevationArray, bins };
  deltaMass.value = Math.round(
    elevationArray.reduce((acc, v) => acc + v, 0) * inputScale.value ** 2,
  );
  loadingData.value = false;

  return canvas;
}
