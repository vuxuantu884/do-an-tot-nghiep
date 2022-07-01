import { Button, Col, Modal, Row } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  isVisibleOrderBillRequestDetailModal: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  orderDetail: OrderResponse | null;
};

function OrderBillRequestDetailModal(props: PropTypes) {
  const {
    isVisibleOrderBillRequestDetailModal,
    handleOk,
    handleCancel,
    orderDetail,
  } = props;

  const bill = orderDetail?.bill;

  const information = [
    {
      title: "Tên công ty",
      value: bill?.company
    },
    {
      title: "Mã số thuế",
      value: bill?.tax
    },
    {
      title: "Địa chỉ",
      value: bill?.address
    },
    {
      title: "Người đại diện",
      value: bill?.pic
    },
    {
      title: "Ghi chú",
      value: bill?.note
    },
    {
      title: "Hợp đồng",
      value: bill?.contract ? "Có hợp đồng" : "Không có hợp đồng"
    },
  ]

  return (
    <Modal
      title="Thông tin xuất hóa đơn"
      width="680px"
      visible={isVisibleOrderBillRequestDetailModal}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={
        <Button key="close" type="primary" onClick={handleOk}>
          Đóng
        </Button>
      }
    >
      <StyledComponent>
        {orderDetail?.bill?.id ? (
          <React.Fragment>
            {information.map((single, index) => {
              return (
                <Row gutter={30} key={index}>
                  <Col span={8}>
                    <div className="label">{single.title}:</div>
                  </Col>
                  <Col span={16}><strong>{single.value}</strong></Col>
                </Row>
              )
            })}
          </React.Fragment>
        ) : (
          "Đơn hàng không có thông tin xuất hóa đơn"
        )}
      </StyledComponent>
    </Modal>
  );
}

export default OrderBillRequestDetailModal;
