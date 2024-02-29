import ResultsLoading from "../subComponents/ResultsLoading.tsx";
import {BarChart} from "../subComponents/BarChart.tsx";
import {ElevationDataType} from "../../state/application-state.ts";
import {formatBigNumber} from "../../utils/misc.ts";

type Props = {
  loading: boolean;
  deltaMass: number | undefined;
  elevation: ElevationDataType | undefined;
}

export default function AllResults({ loading, deltaMass, elevation }: Props) {

  return (
    <>
      <h3>Elevation difference stats</h3>
      {loading ? (
        <ResultsLoading />
      ) : (
        <>
          {deltaMass ? (
            <p style="font-size: 1.15em">
              Mass difference:
              <b> {deltaMass > 0 ? "+" : null}{formatBigNumber(deltaMass)}</b> m3
            </p>
          ) : (
            <p>
              Calculate elevation difference to see mass displacement results.
            </p>
          )}
          <BarChart data={elevation} type={"diff"} />
          <BarChart data={elevation} type={"hist"} />
        </>
      )}
    </>
  );
}
