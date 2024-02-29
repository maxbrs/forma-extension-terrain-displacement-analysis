import { useEffect } from "preact/hooks";
import { getJSONObject } from "./services/Storage.ts";
import {
  DEFAULT_SETTINGS,
  helpDismissed,
  loadingData,
  projectSettings,
} from "./state/application-state.ts";
import AllInputs from "./components/mainComponents/AllInputs.tsx";
import AllResults from "./components/mainComponents/AllResults.tsx";
import InfoBox from "./components/subComponents/InfoBox.tsx";

export const CANVAS_NAME = "mass displacement";

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "weave-button": JSX.HTMLAttributes<HTMLElement> & {
//         authContext: string
//         elementUrnPrefix: string
//         activeAnalysis: string
//         typeFilter?: string[]
//       }
//     }
//   }
// }

export default function App() {
  useEffect(() => {
    getJSONObject("settings").then((res) => {
      if (!res) {
        projectSettings.value = DEFAULT_SETTINGS;
        return;
      }
      projectSettings.value = res.data;
    });
  }, []);

  if (!projectSettings.value) {
    return <div>loading...</div>;
  }

  return (
    <>
      <h2 style="margin-top: 15px">Mass Displacement Analysis</h2>
      <InfoBox dismissed={helpDismissed.value} />
      <AllInputs settings={projectSettings.value} />
      <AllResults loading={loadingData.value} />
    </>
  );
}
