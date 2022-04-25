import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";
import { showSuccess } from "utils/ToastUtils";
import { useHistory } from "react-router-dom";
import UrlConfig from "config/url.config";


type ProgressImportCustomerIntoAdjustmentModalType = {
  visible: boolean;
  isDownloading: boolean;
  onOk: () => void;
  onCancel: () => void;
  progressData: any;
  progressPercent: number;
};


const ProgressImportCustomerIntoAdjustmentModal: React.FC<ProgressImportCustomerIntoAdjustmentModalType> = (
  props: ProgressImportCustomerIntoAdjustmentModalType
) => {
  const {
    visible,
    isDownloading,
    onOk,
    onCancel,
    progressData,
    progressPercent,
  } = props;

  const history = useHistory()

  const [errorData, setErrorData] = useState<Array<any>>([]);

  useEffect(() => {
   const errorList = progressData?.message?.split("\n")
   const checkErrorList = errorList?.filter((item: any) => item !== "")
   setErrorData(checkErrorList);
  }, [progressData]);

  const okProgressImportCustomerModal = () => {
    const getDataObj = JSON.parse(progressData?.data_response);
    const id = Number(getDataObj.id)
    showSuccess("Tạo mới phiếu điều chỉnh thành công");
    history.replace(`${UrlConfig.CUSTOMER2}-adjustments/${id}`)

    onOk && onOk();
  };

  const cancelProgressImportCustomerModal = () => {
    onCancel && onCancel();
  };


  return (
    <Modal
      width="600px"
      centered
      visible={visible}
      title="Nhập file"
      okText="Xác nhận"
      cancelText="Hủy"
      onCancel={cancelProgressImportCustomerModal}
      closable={false}
      maskClosable={false}
      footer={
        <StyledModalFooter>
          {isDownloading ?
            <Button danger onClick={cancelProgressImportCustomerModal}>
              Hủy
            </Button>
            : <div/>
          }

          <Button
            type="primary"
            onClick={okProgressImportCustomerModal}
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
              <div>Đã xử lý</div>
              <div style={{fontWeight: "bold"}}>
                {isNullOrUndefined(progressData?.processed) ?
                  "--" :
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
                {isNullOrUndefined(progressData?.success) ?
                  "--" :
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
                {isNullOrUndefined(progressData?.error) ?
                  "--" :
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

        {errorData?.length ?
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

export default ProgressImportCustomerIntoAdjustmentModal;
