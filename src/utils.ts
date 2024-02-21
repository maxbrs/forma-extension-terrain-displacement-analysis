// const colors = [
//   "rgba(169, 189, 5, 0.9)",
//   "rgba(153, 181, 6, 0.9)",
//   "rgba(136, 172, 7, 0.9)",
//   "rgba(39, 123, 12, 0.9)",
//   "rgba(120, 164, 8, 0.9)",
//   "rgba(104, 156, 9, 0.9)",
//   "rgba(88, 148, 9, 0.9)",
//   "rgba(72, 140, 10, 0.9)",
//   "rgba(55, 131, 11, 0.9)",
//   "rgba(23, 115, 13, 0.9)",
// ];

// const colorStep = 25;
// const colors = [...Array(colorStep).keys()].map((i) => {
//   return `rgba(0, 0, ${(i/colorStep) * 255}, 0.9)`;
// });

const colors = [
  "rgba(255, 0, 0, 0.9)",
  "rgba(255, 62, 34, 0.9)",
  "rgba(255, 91, 58, 0.9)",
  "rgba(255, 115, 82, 0.9)",
  "rgba(255, 137, 105, 0.9)",
  "rgba(255, 158, 129, 0.9)",
  "rgba(255, 178, 153, 0.9)",
  "rgba(255, 198, 178, 0.9)",
  "rgba(255, 217, 203, 0.9)",
  "rgba(255, 236, 229, 0.9)",
  "rgba(255, 255, 255, 0.9)",
  "rgba(241, 255, 235, 0.9)",
  "rgba(226, 255, 215, 0.9)",
  "rgba(211, 255, 195, 0.9)",
  "rgba(195, 255, 175, 0.9)",
  "rgba(177, 255, 154, 0.9)",
  "rgba(158, 255, 133, 0.9)",
  "rgba(137, 255, 111, 0.9)",
  "rgba(112, 255, 87, 0.9)",
  "rgba(79, 255, 59, 0.9)",
  "rgba(0, 255, 0, 0.9)",
];

export function createCanvas(
  array: Float32Array,
  width: number,
  height: number,
  minElevation: number,
  maxElevation: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  if (minElevation === maxElevation) {
    // if the min and max elevation are the same, the canvas will be all white
    console.log({ minElevation, maxElevation });
    return canvas;
  }

  const ctx = canvas.getContext("2d");
  // const colorGrading = threshold / colors.length;
  const highestDiff = Math.max(
    0,
    Math.abs(minElevation),
    Math.abs(maxElevation),
  );
  console.log({ minElevation, maxElevation, highestDiff, array });
  // [x * diffX + y]
  for (let i = 0; i < array.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);

    const idx = Math.floor(
      ((array[i] - minElevation) / (maxElevation - minElevation)) *
        colors.length,
    );

    // // get an index so that the color is white (10th) if the value is 0, and either green or red (1st or last) if the absolute value is the highest
    // const idx = Math.floor((array[i] + highestDiff) / (2 * highestDiff) * (colors.length - 1))
    ctx!.fillStyle = colors[idx];
    ctx!.fillRect(x, height - y, 1, 1);
  }
  return canvas;
}
