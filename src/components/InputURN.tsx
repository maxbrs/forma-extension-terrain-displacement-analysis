import {inputScale, projectSettings} from "../state/application-state.ts";
import {saveJSONObject} from "../services/Storage.ts";
import {useCallback} from "preact/hooks";

export type Settings = {
  oldTerrainUrn: string;
  newTerrainUrn: string;
};

type Props = {
  settings: Settings;
};

export default function InputURN({ settings }: Props) {
  const saveSettings = useCallback(async () => {
    await saveJSONObject("settings", settings);
  }, [settings]);

  return (
    <>
      <h3>Add URNs of terrains to compare</h3>
      <div className="section">
        <p>Initial terrain</p>
        <input
          type="string"
          value={settings.oldTerrainUrn}
          onChange={(e) => projectSettings.value = ({
            ...settings,
            oldTerrainUrn: e.currentTarget.value,
          })}/>
      </div>
      <div className="section">
        <p>Alternative terrain</p>
        <input
          type="string"
          value={projectSettings.value?.newTerrainUrn}
          onChange={(e) => projectSettings.value = ({
            ...settings,
            newTerrainUrn: e.currentTarget.value,
          })}/>
      </div>
      <div className="section">
        <p>Sampling scale</p>
        <>
          <p>{inputScale.value}m</p>
          <input
            style={{width: "50%"}}
            type="range"
            min="1"
            max="10"
            value={inputScale.value}
            onChange={(e) => (inputScale.value = Number(e.currentTarget.value))}/>
        </>
      </div>
      <button onClick={saveSettings} style="width: 100%">
        Save inputs
      </button>
    </>
  )
}
