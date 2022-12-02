import { isNullOrUndefined } from "utils/AppUtils";
import NumberFormat from "react-number-format";
import { Progress } from "antd";
import { StyledProgressDownloadInfo } from "./style";
import React from "react";
import { FINISH_PROCESS_PERCENT, ProgressStatuses } from "screens/products/helper";

type process = {
  total: number;
  processed: number;
  success: number;
  error: number;
  percent: number;
};

type ProcessDownloadProps = {
  errorData: Array<string>,
  progressData: process
};

const ProcessDownloadInfo = (props: ProcessDownloadProps) => {
  const { errorData, progressData } = props;
  return (
    <StyledProgressDownloadInfo>
      <div>
        <div className="progress-body" style={{ marginTop: "30px" }}>
          <div className="progress-count">
            <div>
              <div>Tổng cộng</div>
              <div className="total-count">
                {isNullOrUndefined(progressData?.total) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.total}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
              </div>
            </div>

            <div>
              <div>Đã xử lý</div>
              <div style={{ fontWeight: "bold" }}>
                {isNullOrUndefined(progressData?.processed) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.processed}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
              </div>
            </div>

            <div>
              <div>Thành công</div>
              <div className="total-updated">
                {isNullOrUndefined(progressData?.success) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.success}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
              </div>
            </div>

            <div>
              <div>Lỗi</div>
              <div className="total-error">
                {isNullOrUndefined(progressData?.error) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.error}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
              </div>
            </div>
          </div>
          <Progress
            status={`${progressData.percent === FINISH_PROCESS_PERCENT
              ? ProgressStatuses.NORMAL
              : ProgressStatuses.ACTIVE}`}
            percent={progressData.percent}
            style={{ marginTop: 20 }}
            strokeColor="#2A2A86"
          />
        </div>
        <div className="import-info">
          <div className="content">
            {errorData?.length ? (
              <div className="error-orders">
                <div className="error_message">
                  <div
                    style={{
                      backgroundColor: "#F5F5F5",
                      padding: "20px 30px",
                    }}
                  >
                    <ul style={{ color: "#E24343" }}>
                      {errorData.map((error, index) => (
                        <li key={index} style={{ marginBottom: "5px" }}>
                          <span style={{ fontWeight: 500 }}>{error.split(":")[0]}</span>
                          <span>:</span>
                          <span>{error.split(":")[1]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </StyledProgressDownloadInfo>
  )
}

export default ProcessDownloadInfo;