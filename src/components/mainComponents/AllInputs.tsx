import InputURN, {Settings} from "../subComponents/InputURN.tsx";
import {deltaMass, elevation, loadingData} from "../../state/application-state.ts";
import CalculateAndStore from "../subComponents/Calculate.tsx";
import {Forma} from "forma-embedded-view-sdk/auto";
import {CANVAS_NAME} from "../../App.tsx";
import {useCallback} from "preact/hooks";

type Props = {
  settings: Settings;
};

export default function AllInputs({ settings }: Props) {
  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
    elevation.value = undefined;
    deltaMass.value = undefined;
    loadingData.value = false;
  }, []);

  // const testCode = useCallback(async () => {
  //   // console.log("Testing code ...");
  //   const selectedPaths = await Forma.selection.getSelection()
  //   const buildingPaths = await Forma.geometry.getPathsByCategory({ category: "site_limit" })
  //   const selectedSiteLimitsPaths = selectedPaths.filter(path => buildingPaths.includes(path))
  //   console.log("Test ... ", { selectedSiteLimitsPaths, length: selectedSiteLimitsPaths.length });
  // }, []);

  return (
    <>
      {/*<Tabs><Tab><p>hello</p></Tab><Tab><p>This is Tab 2 content</p></Tab></Tabs>*/}
      <InputURN settings={settings}></InputURN>
      {/*<InputSiteLimit siteLimits={selectedSiteLimits.value}></InputSiteLimit>*/}
      <CalculateAndStore
        oldTerrainUrn={settings.oldTerrainUrn}
        newTerrainUrn={settings.newTerrainUrn}
      />
      <button
        onClick={removeTerrainSlope}
        style="width: 100%"
        disabled={!elevation.value}
        onMouseOver={() =>
          elevation.value ? "" : "Click on 'Calculate' first."
        }
      >
        Remove results from terrain
      </button>
      {/*<button onClick={testCode} style="width: 100%">Test code ...</button>*/}
    </>
  );
}
