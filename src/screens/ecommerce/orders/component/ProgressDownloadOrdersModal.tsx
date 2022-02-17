import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
// import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";

type ProgressDownloadOrdersModalType = {
  visible: boolean;
  isDownloading: boolean;
  onOk: () => void;
  onCancel: () => void;
  progressData: any;
  progressPercent: number;
};


const ProgressDownloadOrdersModal: React.FC<ProgressDownloadOrdersModalType> = (
  props: ProgressDownloadOrdersModalType
) => {
  const { visible, isDownloading, onOk, onCancel, progressData, progressPercent } = props;
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

  // const columns: Array<ICustomTableColumType<any>> = [
  //   {
  //     title: "STT",
  //     align: "center",
  //     width: 70,
  //     render: (value: any, row: any, index: any) => {
  //       return <span>{index + 1}</span>;
  //     },
  //   },
  //   {
  //     title: "Mã đơn hàng",
  //     dataIndex: "order_sn",
  //     width: 155,
  //   },
  //   {
  //     title: "Nội dung",
  //     dataIndex: "error_message",
  //     render: (value: any, item: any, index: number) => {
  //       return (
  //         <div>
  //           {value[0]}
  //         </div>
  //       );
  //     },
  //   },
  // ];


  return (
    <Modal
      width="600px"
      centered
      visible={visible}
      title="Tải đơn hàng"
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
            : <div></div>
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
            
            <div>
              <div>ĐH mới</div>
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
            
            <div>
              <div>ĐH cập nhật</div>
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
              <div style={{ backgroundColor: "#F5F5F5", padding: "20px 30px" }}>
                <ul style={{ color: "#E24343" }}>
                  {errorData.map((error, index) => (
                      <li key={index} style={{ marginBottom: "5px"}}>
                        <span>{error}</span>
                      </li>
                  ))}
                </ul>
              </div>
            </div> : <div/>}
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ProgressDownloadOrdersModal;
