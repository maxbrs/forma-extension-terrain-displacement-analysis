import { useCallback, useEffect } from "preact/hooks";
import { helpDismissed } from "../../state/application-state.ts";
import { SESSION_STORAGE_PREFIX } from "../../App.tsx";

type Props = {
  dismissed: boolean;
};

export default function InfoBox({ dismissed }: Props) {
  useEffect(() => {
    helpDismissed.value = !!sessionStorage.getItem(
      `${SESSION_STORAGE_PREFIX}-help-info-dismissed`,
    );
  }, []);

  const setDismissed = useCallback(() => {
    sessionStorage.setItem(
      `${SESSION_STORAGE_PREFIX}-help-info-dismissed`,
      "true",
    );
    helpDismissed.value = true;
  }, []);

  // TODO : placeholder URL
  const url = "https://www.youtube.com/embed/iNJxisff8gw?si=ujTLScLIB8XA1uk2";

  return (
    (!dismissed && (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "25px",
        }}
      >
        <iframe
          width="100%"
          src={url}
          title="YouTube video : how to use the mass displacement analysis extension for Forma"
          frameBorder="0"
          sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={true}
        ></iframe>
        <button
          style={{ width: "30%", marginTop: "5px" }}
          onClick={setDismissed}
        >
          Dismiss
        </button>
      </div>
    )) ||
    null
  );
}
