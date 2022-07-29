import React, { useEffect } from "react";
import { getWithExpiry, setWithExpiry } from "../utils/LocalStorageUtils";
import styled from "styled-components";
import UpdateVersionImage from "../assets/img/update-version.png";
import ErrorBoundaryImage from "../assets/img/error-boundary.png";
import { Button } from "antd";
import { useInterval } from "react-use";

const TIME_OUT = 5000;
const DELAY = 1000;

export function ErrorFallback({ error, resetErrorBoundary }: any) {
  const [countdown, setCoutdown] = React.useState(TIME_OUT);

  const chunkFailedMessage = /Loading chunk [\d]+ failed/;
  const errorLoadChunk = error?.message && chunkFailedMessage.test(error?.message);

  // Handles failed lazy loading of a JS/CSS chunk by displaying an error message
  useEffect(() => {
    if (errorLoadChunk) {
      if (!getWithExpiry("chunk_failed")) {
        setWithExpiry("chunk_failed", "true", 10000);
        setTimeout(() => {
          window.location.reload();
        }, TIME_OUT);
      }
    }
  }, [errorLoadChunk]);

  useInterval(
    () => {
      setCoutdown((count) => count - DELAY);
    },
    countdown === 0 ? null : DELAY,
  );

  if (errorLoadChunk) {
    return (
      <ErrorWrapper>
        <img src={UpdateVersionImage} alt={""} />
        <h1>
          Hệ thống đang có bản cập nhật mới, bạn vui lòng đợi trong giây lát!{" "}
          {countdown ? <span className="countdown">{countdown / 1000}s</span> : null}
        </h1>
        <Button onClick={window.location.reload}>Thử lại!</Button>
      </ErrorWrapper>
    );
  }
  return (
    <ErrorWrapper>
      <img
        src={ErrorBoundaryImage}
        alt={""}
        className="img-error"
        width={"412px"}
        height={"412px"}
      />
      <h1>Đã xảy ra lỗi hệ thống: </h1>
      <pre>{error?.message}</pre>
      <p>Vui lòng thử lại sau 5 phút hoặc liên hệ với phòng IT để được hỗ trợ kịp thời.</p>
      <Button onClick={resetErrorBoundary}>Thử lại!</Button>
    </ErrorWrapper>
  );
}

const ErrorWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  margin-top: 50px;

  pre {
    max-width: 90%;
  }
  .countdown {
    color: red;
  }
`;
