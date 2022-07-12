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

  const billingAddress = orderDetail?.billing_address;

  const billExportInformation = [
    {
      title: "Tên đơn vị mua hàng",
      value: billingAddress?.buyer
    },
    {
      title: "Mã số thuế",
      value: billingAddress?.tax_code
    },
    {
      title: "Địa chỉ xuất hóa đơn",
      value: billingAddress?.full_address
    },
    {
      title: "Người đại diện theo pháp luật",
      value: billingAddress?.name
    },
    {
      title: "Email nhận hóa đơn điện tử",
      value: billingAddress?.email
    },
    {
      title: "Ghi chú",
      value: billingAddress?.note
    },
    {
      title: "Hợp đồng",
      value: billingAddress?.contract ? "Có hợp đồng" : "Không có hợp đồng"
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
        {billingAddress?.order_id ? (
          <React.Fragment>
            {billExportInformation.map((single, index) => {
              return (
                <Row gutter={30} key={index}>
                  <Col span={8}>
                    <div className="label">{single.title}:</div>
                  </Col>
                  <Col span={16}><strong>{single.value || "-"}</strong></Col>
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
