import { ResponsiveBar } from "@nivo/bar"
import {ElevationDataType} from "../state/application-state.ts";
import { useMemo } from "preact/hooks";


interface BarChartProps {
  data: ElevationDataType | undefined;
  showPercent?: boolean
}

function removeConsecutiveZeros(data: { index: string, x: number }[]): { index: string, x: number }[] {
  let firstNonZero = data.findIndex(item => item.x !== 0);
  let lastNonZero = data.length - 1 - data.slice().reverse().findIndex(item => item.x !== 0);

  if (firstNonZero === -1 && lastNonZero === -1) {
    return [];
  } else {
    return data.slice(firstNonZero, lastNonZero + 1);
  }
}

function restructureData(data: { array: Float32Array, bins: number[][] }): { index: string, x: number }[] | undefined {
  const array = data.array.filter((x) => Math.abs(x) > .5);
  let result: { index: string, x: number }[] = [];
  // Assuming that the bins are sorted and non-overlapping
  for (let i = 0; i < data.bins.length; i++) {
    let count = 0;
    for (let j = 0; j < data.array.length; j++) {
      if (data.bins[i][0] <= array[j] && array[j] < data.bins[i][1]) {
        count++;
      }
    }
    const binAvg = Number((data.bins[i][0] + data.bins[i][1]) / 2).toFixed(0);
    // const [start, end] = data.bins[i].map(num => Number(num.toFixed(1)));
    result.push({ index: `~ ${binAvg} m`, x: count });
    // result.push({ index: `~ ${binAvg} m`, x: data.bins[i][1] < 0 ? -count : count });
  }
  const filteredResult = removeConsecutiveZeros(result)
  if (!result || result.length === 0) {
    return;
  }
  return filteredResult.reverse();
}

export function BarChart({ data }: BarChartProps) {
  const updatedChartData = useMemo(() => {

    if (!data || data.array.length === 0) {
      return null;
    }
    console.log("Hist", {data})
    const chartData = restructureData(data)

    // const d = [
    //   {index: 'A', x: 10},
    //   {index: 'B', x: 15},
    //   {index: 'C', x: 20},
    //   {index: 'D', x: 13},
    //   {index: 'E', x: 17}
    // ]
    return chartData
    }, [data])

  console.log("updatedChartData", updatedChartData)
  return (
    (updatedChartData && (
      <ResponsiveBar
        data={updatedChartData}
        keys={['x']}
        indexBy="index"
        layout="horizontal"
        margin={{ top: 50, right: 20, bottom: 60, left: 70 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 90,
          legend: 'Area',
          legendPosition: 'middle',
          legendOffset: 55
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Elevation difference (m)',
          legendPosition: 'middle',
          legendOffset: -65
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[]}
        animate={true}
      />
    )) ||
    <p>nothing to see here ...</p>
  )
}
