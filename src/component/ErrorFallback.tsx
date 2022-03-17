import React, { useEffect } from "react";
import {getWithExpiry, setWithExpiry} from "../utils/LocalStorageUtils";

export function ErrorFallback({ error }: {error: any}) {
  // Handles failed lazy loading of a JS/CSS chunk by displaying an error message
  useEffect(() => {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (error?.message && chunkFailedMessage.test(error?.message)) {
      if (!getWithExpiry("chunk_failed")) {
        setWithExpiry("chunk_failed", "true", 10000);
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <>
      <pre>{error?.message}</pre>
    </>
  );
}
