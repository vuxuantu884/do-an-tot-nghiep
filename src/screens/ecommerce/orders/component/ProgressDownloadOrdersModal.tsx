import React, { useEffect, useState } from "react";
import { Button, Modal, Progress } from "antd";

import { StyledProgressDownloadEcommerceOrder, StyledProgressDownloadFooter } from "screens/ecommerce/orders/orderStyles";
import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";


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

  useEffect(() => {
    setErrorData(progressData?.errors_msg);
  }, [progressData?.errors_msg]);

  const okProgressDownloadModal = () => {
    onOk && onOk();
  };

  const cancelProgressDownloadModal = () => {
    onCancel && onCancel();
  };

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: 70,
      render: (value: any, row: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "order_sn",
      width: 155,
    },
    {
      title: "Nội dung",
      dataIndex: "error_message",
      render: (value: any, item: any, index: number) => {
        return (
          <div>
            {value[0]}
          </div>
        );
      },
    },
  ];


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
        <StyledProgressDownloadFooter>
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
        </StyledProgressDownloadFooter>
      }
    >
      <StyledProgressDownloadEcommerceOrder>
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
            status={`${progressPercent === 100 ? "success" : "active"}`}
            percent={progressPercent}
            style={{ marginTop: 20 }}
          />
        </div>

        {errorData && errorData.length &&
          <div className="error-orders">
            <div className="title">Chi tiết lỗi:</div>
            
            <CustomTable
              bordered
              sticky={{ offsetScroll: 1 }}
              pagination={false}
              dataSource={errorData}
              columns={columns}
              rowKey={(item: any) => item.order_sn}
            />
          </div>
          }
      </StyledProgressDownloadEcommerceOrder>
    </Modal>
  );
};

export default ProgressDownloadOrdersModal;
