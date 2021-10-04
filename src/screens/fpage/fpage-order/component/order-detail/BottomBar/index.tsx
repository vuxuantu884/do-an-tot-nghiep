import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, FormInstance, Menu, Row } from "antd";
import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import IconPrint from "assets/icon/printer.svg";
import { StyledComponent } from "./styles";

type PropType = {
  orderDetail?: OrderResponse | null;
  isVisibleGroupButtons?: boolean;
  isVisibleActionsButtons?: boolean;
  isVisibleUpdateButtons?: boolean;
  stepsStatusValue?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
  orderActionsClick?: (type: string) => void;
  updateCancelClick?: () => void;
};

const OrderDetailBottomBar: React.FC<PropType> = (props: PropType) => {
  const {
    orderDetail,
    isVisibleGroupButtons,
    isVisibleActionsButtons,
    isVisibleUpdateButtons,
    stepsStatusValue,
    formRef,
    handleTypeButton,
    showSaveAndConfirmModal,
    orderActionsClick,
    updateCancelClick
  } = props;

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col
          md={10}
          style={{ marginLeft: "-10px", marginTop: "3px", padding: "3px" }}
        >
          <CreateBillStep status={stepsStatusValue} orderDetail={orderDetail} />
        </Col>
        {isVisibleGroupButtons &&
          formRef &&
          handleTypeButton &&
          showSaveAndConfirmModal && (
          <Col md={9} style={{ marginTop: "8px" }}>
            <Button
              style={{ padding: "0 25px", fontWeight: 400 }}
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => window.location.reload()}
            >
              Huỷ
            </Button>
            <Button
              style={{ padding: "0 25px", fontWeight: 400 }}
              className="create-button-custom ant-btn-outline fixed-button"
              type="primary"
              onClick={showSaveAndConfirmModal}
            >
              Lưu nháp
            </Button>
            <Button
              style={{ padding: "0 25px", fontWeight: 400 }}
              type="primary"
              className="create-button-custom"
              id="save-and-confirm"
              onClick={() => {
                handleTypeButton(OrderStatus.FINALIZED);
                formRef.current?.submit();
              }}
            >
              Lưu và Xác nhận
            </Button>
          </Col>
        )}
        {isVisibleUpdateButtons &&
          formRef &&
          handleTypeButton &&
          showSaveAndConfirmModal && (
          <Col md={9} style={{ marginTop: "8px" }}>
            <Button
              style={{ padding: "0 25px", fontWeight: 400 }}
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => updateCancelClick && updateCancelClick()}
            >
              Huỷ
            </Button>
            
            <Button
              style={{ padding: "0 25px", fontWeight: 400 }}
              type="primary"
              className="create-button-custom"
              id="save-and-confirm"
              onClick={() => {
                handleTypeButton(OrderStatus.FINALIZED);
                console.log(
                  "formRef.current.value",
                  formRef?.current?.getFieldsValue()
                );
                formRef.current?.submit();
              }}
            >
              Cập nhật đơn hàng
            </Button>
          </Col>
        )}
        {isVisibleActionsButtons &&(
          <Col md={10} style={{ marginTop: "8px" }}>
            <Dropdown
              // overlayStyle={{ minWidth: "15rem" }}
              getPopupContainer={trigger => trigger}
              overlay={
                <Menu >
                  <Menu.Item
                    key="update"
                    onClick={() => orderActionsClick && orderActionsClick('update')}
                    // disabled={stepsStatusValue === OrderStatus.CANCELLED || stepsStatusValue === FulFillmentStatus.SHIPPED}
                  >
                    Sửa đơn hàng
                  </Menu.Item>
                  <Menu.Item
                    key="cancel"
                    onClick={() => orderActionsClick && orderActionsClick('cancel')}
                    disabled={stepsStatusValue === OrderStatus.CANCELLED || stepsStatusValue === FulFillmentStatus.SHIPPED || stepsStatusValue === FulFillmentStatus.SHIPPING}
                  >
                    Huỷ đơn hàng
                  </Menu.Item>
                  <Menu.Item
                    key="clone"
                    onClick={() => orderActionsClick && orderActionsClick('clone')}
                  >
                    Sao chép đơn hàng
                  </Menu.Item>
                </Menu>
              }
              
              trigger={["click"]}
            >
              <Button style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}>
                Thêm thao tác <DownOutlined />
              </Button>
            </Dropdown>
            <Dropdown
              // overlayStyle={{ minWidth: "15rem" }}
              getPopupContainer={trigger => trigger}
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => props.orderActionsClick && props.orderActionsClick('cancel')}
                  >
                    In nhanh
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => props.orderActionsClick && props.orderActionsClick('clone')}
                  >
                    In tuỳ chọn
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button type="primary" style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}>
                <img src={IconPrint} alt="" style={{paddingRight: '10px'}}/> In đơn hàng 
              </Button>
            </Dropdown>
          </Col>
        )}
      </Row>
    </StyledComponent>
  );
};

export default OrderDetailBottomBar;
