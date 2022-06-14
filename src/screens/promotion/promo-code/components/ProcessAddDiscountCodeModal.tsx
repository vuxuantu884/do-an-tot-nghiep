import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

type ProgressImportCustomerModalType = {
  visible: boolean;
  isProcessing: boolean;
  onOk: () => void;
  progressData: any;
  progressPercent: number;
};

const ProcessAddDiscountCodeModal: React.FC<ProgressImportCustomerModalType> = (
  props: ProgressImportCustomerModalType
) => {
  const { visible, isProcessing, onOk, progressData, progressPercent } = props;

  const [isVisibleExitProcessModal, setIsVisibleExitProcessModal] = useState<boolean>(false);
  const [errorData, setErrorData] = useState<Array<any>>([]);

  useEffect(() => {
    if (progressData?.message) {
    const errorList = progressData?.message.slice(0).split("\n");
    const checkErrorList = errorList.filter((item: any) => item !== "")
    setErrorData(checkErrorList);
    }
  }, [progressData?.message]);

  const onOkProgressModal = () => {
    onOk && onOk();
  };

  const onCancelProgressModal = () => {
    setIsVisibleExitProcessModal(true);
  };
  
  const onOkExitProgressModal = () => {
    setIsVisibleExitProcessModal(false);
    onOk && onOk();
  }


  return (
    <>
      <Modal
        width="600px"
        centered
        visible={visible}
        title="Thêm mã giảm giá"
        okText="Xác nhận"
        cancelText="Hủy"
        onCancel={onCancelProgressModal}
        closable={false}
        maskClosable={false}
        footer={
          <StyledModalFooter>
            {isProcessing ?
              <Button danger onClick={onCancelProgressModal}>Hủy</Button>
              : <div />
            }

            <Button
              type="primary"
              onClick={onOkProgressModal}
              loading={isProcessing}
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
                  {isNullOrUndefined(progressData?.total) ? "--" :
                    <NumberFormat
                      value={progressData?.total}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>

              <div>
                <div>Đã xử lý</div>
                <div style={{fontWeight: "bold"}}>
                  {isNullOrUndefined(progressData?.processed) ? "--" :
                    <NumberFormat
                      value={progressData?.processed}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>

              <div>
                <div>Thành công</div>
                <div className="total-updated">
                  {isNullOrUndefined(progressData?.success) ? "--" :
                    <NumberFormat
                      value={progressData?.success}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>

              <div>
                <div>Lỗi</div>
                <div className="total-error">
                  {isNullOrUndefined(progressData?.error) ? "--" :
                    <NumberFormat
                      value={progressData?.error}
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
            : <div />
          }
        </StyledProgressDownloadModal>
      </Modal>

      {isVisibleExitProcessModal &&
        <Modal
          width="600px"
          centered
          visible={isVisibleExitProcessModal}
          title=""
          maskClosable={false}
          onCancel={() => setIsVisibleExitProcessModal(false)}
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={onOkExitProgressModal}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy thêm mới mã giảm giá không?</strong>
              <div style={{ fontSize: 14 }}>
                <div>Hệ thống sẽ dừng việc thêm mới mã giảm giá.</div>
                <div>Các mã đã được tạo thành công sẽ hiển thị trong danh sách mã giảm giá."</div>
              </div>
            </div>
          </div>
        </Modal>
      }
    </>
  );
};

export default ProcessAddDiscountCodeModal;
