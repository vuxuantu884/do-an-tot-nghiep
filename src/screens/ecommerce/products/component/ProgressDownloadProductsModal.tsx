import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import {ECOMMERCE_JOB_TYPE} from "../../../../utils/Constants";
import {ECOMMERCE_JOB_DETAIL} from "../../common/EcommerceJobEnum";


type ProgressDownloadProductsModalType = {
  visible: boolean;
  isDownloading: boolean;
  onOk: () => void;
  onCancel: () => void;
  progressData: any;
  progressPercent: number;
  processType: string;
};


const ProgressDownloadProductsModal: React.FC<ProgressDownloadProductsModalType> = (
  props: ProgressDownloadProductsModalType
) => {
  const {
    visible,
    isDownloading,
    onOk,
    onCancel,
    progressData,
    progressPercent,
    processType
    } = props;

  const [errorData, setErrorData] = useState<Array<any>>([]);
  useEffect(() => {
    if (progressData?.errors_msg) {
      const errorList = progressData?.errors_msg.slice(1).split("\n");
      setErrorData(errorList);
    }
  }, [progressData?.errors_msg]);

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
      title={ECOMMERCE_JOB_DETAIL.getDisplay(processType)}
      okText="Xác nhận"
      cancelText="Hủy"
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

            {processType === ECOMMERCE_JOB_TYPE.VARIANT &&
            <div>
              <div>SP cha mới</div>
              <div className="total-created">
                {isNullOrUndefined(progressData?.total_created) ?
                  "--" :
                  <NumberFormat
                    value={progressData?.total_created}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>
            }

            {processType === ECOMMERCE_JOB_TYPE.VARIANT &&
                <div>
                  <div>SP cha cập nhật</div>
                  <div className="total-updated">
                    {isNullOrUndefined(progressData?.total_updated) ?
                        "--" :
                        <NumberFormat
                            value={progressData?.total_updated}
                            displayType={"text"}
                            thousandSeparator={true}
                        />
                    }
                  </div>
                </div>
            }

            {(processType === ECOMMERCE_JOB_TYPE.STOCK ||
                    processType === ECOMMERCE_JOB_TYPE.SYNC_VARIANT) &&
                <div>
                  {processType === ECOMMERCE_JOB_TYPE.STOCK && <div>Đồng bộ tồn thành công</div>}
                  {processType === ECOMMERCE_JOB_TYPE.SYNC_VARIANT && <div>Ghép nối thành công</div>}
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
            }

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
                        <li key={index} style={{ marginBottom: "5px"}}>
                          <span style={{fontWeight: 500}}>{error.split(":")[0]}</span>
                          <span>:</span>
                          <span>{error.split(":")[1]}</span>
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            : <div/>}
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ProgressDownloadProductsModal;
