import { Button, Modal } from 'antd';
import React from 'react';
import { StyledModalFooterSingle } from 'screens/ecommerce/common/commonStyle';
import successIcon from 'assets/icon/success.svg';
import errorIcon from 'assets/icon/error.svg';
import { ErrorMessageBatchShipping } from 'model/ecommerce/ecommerce.model';
import './style.scss'

export interface PreparationShopeeProductModalProps {
    title: string;
    visible: boolean;
    onOk: any;
    onCancel: any;
    okText: string;
    cancelText: string;
    shopeePreparationData: Array<ErrorMessageBatchShipping>;
    orderSuccessMessage: Array<string>;
    orderErrorMessage: Array<string>;
}

function PreparationShopeeProductModal (props: PreparationShopeeProductModalProps) {

  const {
    title,
    visible,
    onOk,
    onCancel,
    okText,
    cancelText,
    shopeePreparationData,
    orderSuccessMessage,
    orderErrorMessage,
  } = props
  
  const moduleName = "Báo Shopee Chuẩn bị hàng"

  return (
    <Modal
       title={title}
       visible={visible}
       onOk={onOk}
       onCancel={onCancel}
       okText={okText}
       cancelText={cancelText}
       footer={
        <StyledModalFooterSingle>
          <Button
            type="primary"
            onClick={onOk}
          >
            Xác nhận
          </Button>
        </StyledModalFooterSingle>
      }
      className="error-logs-modal"
    >
      <div className="error-logs-body">
        <div className="error-summary">
          <img src={successIcon} style={{ marginRight: '6px' }} alt="success" /><span>Có <span className="text-success">{orderSuccessMessage.length}</span> đơn hàng <span className="text-success">{moduleName}</span> thành công </span>
        </div>
        <div className="error-summary">
          <img src={errorIcon} style={{ marginRight: '6px' }} alt="success" /><span>Có <span className="text-error">{orderErrorMessage.length}</span> đơn hàng <span className="text-error">{moduleName}</span> thất bại</span>
        </div>
        <div className="error-details">
          <span>Chi tiết lỗi:</span>
          <div className="error-message">
            <ul className="error-message-list">
              {
                shopeePreparationData.length && shopeePreparationData?.map((item, idx) => (
                  <React.Fragment>
                    {
                      item.error !== "" &&
                      <li key={idx}>
                        <span>{`${item.order_sn}: `}</span>
                        <span>{item.message}</span>
                    </li>
                  }
                  </React.Fragment>
                ))
              }
            </ul>
          </div>
        </div>
      
      </div>
    </Modal>
  );
}

export default PreparationShopeeProductModal
