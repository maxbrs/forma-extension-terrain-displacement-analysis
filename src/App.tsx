import { useEffect } from "preact/hooks";
import { getJSONObject } from "./services/Storage.ts";
import {
  DEFAULT_SETTINGS,
  deltaMass,
  elevation,
  helpDismissed,
  initialized,
  loadingData,
  projectSettings,
} from "./state/application-state.ts";
import AllInputs from "./components/mainComponents/AllInputs.tsx";
import AllResults from "./components/mainComponents/AllResults.tsx";
import InfoBox from "./components/subComponents/InfoBox.tsx";
import { Forma } from "forma-embedded-view-sdk/auto";

export const CANVAS_NAME = "mass displacement";
export const SESSION_STORAGE_PREFIX = "extension-MDA";

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
    Forma.proposal.subscribe(({ rootUrn }) => {
      console.log("updated urn is", rootUrn);
      initialized.value = false;
      projectSettings.value = undefined;
      elevation.value = undefined;
      deltaMass.value = undefined;
      loadingData.value = false;
    });
  }, []);

  useEffect(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
    elevation.value = undefined;
    deltaMass.value = undefined;
    loadingData.value = false;
    getJSONObject("settings").then((res) => {
      if (!res) {
        projectSettings.value = DEFAULT_SETTINGS;
        return;
      }
      projectSettings.value = res.data;
    });
  }, [initialized.value]);

  if (!projectSettings.value) {
    return <div>loading...</div>;
  } else {
    initialized.value = true;
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
