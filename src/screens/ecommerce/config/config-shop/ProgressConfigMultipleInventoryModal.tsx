import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
// import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";

type ProgressConfigMultipleInventoryModalType = {
  visible: boolean;
  isLoading: boolean;
  onOk: () => void;
  onCancel: () => void;
  progressData: any;
  progressPercent: number;
};

const ProgressConfigMultipleInventoryModal: React.FC<ProgressConfigMultipleInventoryModalType> = (
  props: ProgressConfigMultipleInventoryModalType,
) => {
  const { visible, isLoading, onOk, onCancel, progressData, progressPercent } = props;
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const okProgressConfigMultipleInventoryModal = () => {
    onOk && onOk();
  };

  const cancelProgressConfigMultipleInventoryModal = () => {
    onCancel && onCancel();
  };

  useEffect(() => {
    if (progressData?.errors_msg) {
      const errorList = progressData?.errors_msg.slice(1).split("\n");
      setErrorData(errorList);
    }
  }, [progressData?.errors_msg]);

  return (
    <Modal
      width="620px"
      centered
      visible={visible}
      title="Đồng bộ tồn"
      okText="Xác nhận"
      cancelText="Hủy"
      onCancel={cancelProgressConfigMultipleInventoryModal}
      closable={false}
      maskClosable={false}
      footer={
        <StyledModalFooter>
          {isLoading ? (
            <Button danger onClick={cancelProgressConfigMultipleInventoryModal}>
              Hủy
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            type="primary"
            onClick={okProgressConfigMultipleInventoryModal}
            loading={isLoading}
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
              <div>Đồng bộ tồn thành công</div>
              <div className="total-created">
                {isNullOrUndefined(progressData?.total_success) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.total_success}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
              </div>
            </div>

            <div>
              <div>Lỗi</div>
              <div className="total-error">
                {isNullOrUndefined(progressData?.total_error) ? (
                  "--"
                ) : (
                  <NumberFormat
                    value={progressData?.total_error}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                )}
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

        {errorData.length ? (
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
        ) : (
          <div />
        )}
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ProgressConfigMultipleInventoryModal;
