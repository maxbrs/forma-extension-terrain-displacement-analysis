import {ElevationDataType} from "../state/application-state.ts";

type HistogramProps = {
  width: number;
  height: number;
  data: ElevationDataType | undefined;
};

export function Histogram({ width, height, data }: HistogramProps) {
  if (!data || data.array.length === 0) {
    return null;
  }
  console.log("Hist", {data, width, height})
  // return null;
  // const bins = data.bins;
  // const array = data.array;
  // const binSize = width / bins.length;
  // const maxElevation = Math.max(...array);
  // const minElevation = Math.min(...array);
  // const range = maxElevation - minElevation;
  // const allRects = [];
  // for (let i = 0; i < bins.length; i++) {
  //   const bin = bins[i];
  //   const binStart = bin[0];
  //   const binEnd = bin[1];
  //   const binData = array.filter((v) => v >= binStart && v < binEnd);
  //   const binHeight = binData.length * (height / range);
  //   allRects.push(
  //     <rect
  //       key={i}
  //       x={i * binSize}
  //       y={height - binHeight}
  //       width={binSize}
  //       height={binHeight}
  //       fill="rgba(255, 0, 0, 1)"
  //     />
  //   );
  // }
  // console.log("allRects", allRects)
  return null;
  // return (
  //   <svg width={width} height={height}>
  //     {allRects}
  //   </svg>
  // );
};
