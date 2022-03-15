import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";
import {showError} from "utils/ToastUtils";

type PrintEcommerceDeliveryNoteProcessType = {
  visible: boolean;
  isProcessing: boolean;
  onOk: () => void;
  onCancel: () => void;
  processData: any;
  processPercent: number;
};


const PrintEcommerceDeliveryNoteProcess: React.FC<PrintEcommerceDeliveryNoteProcessType> = (
  props: PrintEcommerceDeliveryNoteProcessType
) => {
  const { visible, isProcessing, onOk, onCancel, processData, processPercent } = props;
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const [processingCount, setProcessingCount] = useState<any>(null);

  useEffect(() => {
    if (!isNullOrUndefined(processData?.total) &&
      !isNullOrUndefined(processData?.total_created) &&
      !isNullOrUndefined(processData?.total_error)
    ) {
      const count = processData.total - (processData.total_created + processData.total_error);
      setProcessingCount(count);
    } else {
      setProcessingCount(null);
    }
  }, [processData?.total, processData?.total_created, processData?.total_error]);

  useEffect(() => {
    if (processData?.errors_msg) {
      const errorList = processData?.errors_msg.slice(1).split("\n");
      setErrorData(errorList);
    } else {
      setErrorData([]);
    }
  }, [processData?.errors_msg]);

  const handleOnClickOk = () => {
    if (processData?.total_created) {
      onOk && onOk();
    } else {
      showError("Chưa tạo được phiếu giao hàng. Vui lòng kiểm tra lại.")
    }
  }


  return (
    <Modal
      width="600px"
      centered
      visible={visible}
      title="In phiếu giao hàng sàn"
      okText="In"
      cancelText="Hủy"
      onCancel={onCancel}
      closable={false}
      maskClosable={false}
      footer={
        <StyledModalFooter>
          <Button danger onClick={onCancel}>
            Hủy
          </Button>

          <Button
            type="primary"
            onClick={handleOnClickOk}
            loading={isProcessing}
          >
            In
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
              <div>Đang xử lý</div>
              <div className="total-created">
                {isNullOrUndefined(processingCount) ?
                  "--" :
                  <NumberFormat
                    value={processingCount}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                }
              </div>
            </div>

            <div>
              <div>Đã xử lý</div>
              <div className="total-updated">
                {isNullOrUndefined(processData?.total_created) ?
                  "--" :
                  <NumberFormat
                    value={processData?.total_created}
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
            status={`${processPercent === 100 ? "normal" : "active"}`}
            percent={processPercent}
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
          : <div />
        }
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default PrintEcommerceDeliveryNoteProcess;
