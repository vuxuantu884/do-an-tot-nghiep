import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal, StyledModalFooter } from "screens/web-app/common/commonStyle";
import { useHistory } from "react-router";
import { EcommerceProductTabUrl } from "config/url.config";

type ProgressConcatenateByExcelModalType = {
  isVisibleProgressModal: any,
  onCancelProgressConcatenateByExcel: any,
  onOKProgressConcatenateByExcel: any,
  progressData: any,
  progressPercent: any,
  isDownloading: boolean
};

const ProgressConcatenateByExcelModal: React.FC<ProgressConcatenateByExcelModalType> = (
  props: ProgressConcatenateByExcelModalType
) => {
  const { isVisibleProgressModal, onCancelProgressConcatenateByExcel,
    onOKProgressConcatenateByExcel, progressData, progressPercent, isDownloading } = props;

  const [errorData, setErrorData] = useState<Array<any>>([]);

  const history = useHistory();

  useEffect(() => {
    if (progressData?.errors_msg) {
      const errorList = progressData?.errors_msg.slice(1).split("\n");
      setErrorData(errorList);
    }
  }, [progressData?.errors_msg]);

  const okProgressProgressConcatenateByExcelModal = () => {
    onOKProgressConcatenateByExcel();
    history.replace(EcommerceProductTabUrl.CONNECTED);
  };

  const cancelProgressConcatenateByExcelModal = () => {
    onCancelProgressConcatenateByExcel();
  };


  return (
    <Modal
      width="600px"
      centered
      visible={isVisibleProgressModal}
      title="Nhập file"
      okText="Xác nhận"
      cancelText="Hủy"
      onCancel={cancelProgressConcatenateByExcelModal}
      closable={false}
      maskClosable={false}
      footer={
        <StyledModalFooter>
          {isDownloading ?
            <Button danger onClick={cancelProgressConcatenateByExcelModal}>
              Hủy
            </Button>
            : <div />
          }

          <Button
            type="primary"
            onClick={okProgressProgressConcatenateByExcelModal}
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
                {isNullOrUndefined(progressData?.total) ?
                  "--" :
                  <NumberFormat
                    value={progressData?.total}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>

            <div>
              <div>Thành công</div>
              <div className="total-updated">
                {isNullOrUndefined(progressData?.total_success) ?
                  "--" :
                  <NumberFormat
                    value={progressData?.total_success}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>

            <div>
              <div>Lỗi</div>
              <div className="total-error">
                {isNullOrUndefined(progressData?.total_error) ?
                  "--" :
                  <NumberFormat
                    value={progressData?.total_error}
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
            <div className="title">Chi tiết lỗi:</div>
            <div className="error_message">
              <div style={{ backgroundColor: "#F5F5F5", padding: "20px 30px" }}>
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
          : <div />}
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ProgressConcatenateByExcelModal;