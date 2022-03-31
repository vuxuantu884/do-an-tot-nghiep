import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";

type ProcessCreateCardReleaseModalType = {
  visible: boolean;
  isDownloading: boolean;
  onOk: () => void;
  onCancel: () => void;
  processData: any;
  progressPercent: number;
};

const ProcessCreateCardReleaseModal: React.FC<ProcessCreateCardReleaseModalType> = (
  props: ProcessCreateCardReleaseModalType
) => {
  const {
    visible,
    isDownloading,
    onOk,
    onCancel,
    processData,
    progressPercent,
    } = props;

  const [errorData, setErrorData] = useState<Array<any>>([]);

  useEffect(() => {
    if (processData?.errors_msg) {
      const errorList = processData?.errors_msg.slice(1).split("\n");
      setErrorData(errorList);
    }
  }, [processData?.errors_msg]);

  const okProgressDownloadModal = () => {
    onOk && onOk();
  };

  const cancelProgressDownloadModal = () => {
    onCancel && onCancel();
  };

  return (
    <Modal
      width="620px"
      centered
      visible={visible}
      title="Đợt phát hành"
      okText="Xác nhận"
      cancelText="Hủy"
      // onOk={okProgressDownloadModal}
      // okButtonProps={{ loading: isDownloading }}
      onCancel={cancelProgressDownloadModal}
      closable={false}
      maskClosable={false}
      footer={
        <StyledModalFooter>
          {isDownloading ?
            <Button danger onClick={cancelProgressDownloadModal}>
              Hủy
            </Button>
            : <div/>
          }

          <Button
            type="primary"
            onClick={okProgressDownloadModal}
            loading={isDownloading}
            >
            Xác nhận
          </Button>
        </StyledModalFooter>
      }
    >
      <StyledProgressDownloadModal>
        <div className="progress-body">
          <div className="progress-count">
            <div>
              <div>Tổng cộng</div>
              <div className="total-count">
                {isNullOrUndefined(processData?.total) ?
                  "--" :
                  <NumberFormat
                    value={processData?.total}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>

            <div>
              <div>Đã xử lý</div>
              <div className="total-created">
                {isNullOrUndefined(processData?.total_success) && isNullOrUndefined(processData?.total_error) ?
                  "--" :
                  <NumberFormat
                    value={processData?.total_success + processData?.total_error}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>

            <div>
              <div>Thành công</div>
              <div className="total-updated">
                {isNullOrUndefined(processData?.total_success) ?
                    "--" :
                    <NumberFormat
                        value={processData?.total_success}
                        displayType={"text"}
                        thousandSeparator={true}
                    />
                }
              </div>
            </div>

            <div>
              <div>Lỗi</div>
              <div className="total-error">
                {isNullOrUndefined(processData?.total_error) ?
                  "--" :
                  <NumberFormat
                    value={processData?.total_error}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>
          </div>

          <Progress
            status={`${progressPercent === 100 ? "normal" : "active"}`}
            percent={progressPercent}
            style={{ marginTop: 20 }}
            strokeColor="#2A2A86"
          />
        </div>

        {errorData.length ?
          <div className="error-orders">
            <div className="title">Chi tiết:</div>
            <div className="error_message">
              <div style={{ backgroundColor: "#F5F5F5", padding: "20px 30px" }}>
                <ul >
                  {errorData?.length ?
                    errorData.map((error, index) => (
                      <li key={index} style={{ marginBottom: "5px", color: "#E24343" }}>
                        <span style={{fontWeight: 500}}>{error.split(":")[0]}</span>
                        <span>:</span>
                        <span>{error.split(":")[1]}</span>
                      </li>
                    ))
                    :
                    <li style={{ color: "#27AE60" }}>
                      Đang xử lý ...
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
          : <div/>
        }
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ProcessCreateCardReleaseModal;
