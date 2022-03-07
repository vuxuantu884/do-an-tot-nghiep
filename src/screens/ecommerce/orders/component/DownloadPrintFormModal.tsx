import React, {useEffect, useState} from "react";
import {Button, Modal} from "antd";
// import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {StyledModalFooter, StyledProgressDownloadModal} from "screens/ecommerce/common/commonStyle";

type DownloadPrintFormModalType = {
  visible: boolean;
  isDownloading: boolean;
  onOk: () => void;
  onCancel: () => void;
  progressData: any;
  progressPercent: number;
};

const DownloadPrintFormModal: React.FC<DownloadPrintFormModalType> = (
  props: DownloadPrintFormModalType
) => {
  const { visible, isDownloading, onOk, onCancel, progressData } = props;
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const okProgressDownloadModal = () => {
    onOk && onOk();
  };

  const cancelProgressDownloadModal = () => {
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
      title="Tải phiếu giao hàng"
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

export default DownloadPrintFormModal;
