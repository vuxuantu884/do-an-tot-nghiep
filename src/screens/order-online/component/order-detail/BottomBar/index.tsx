import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, FormInstance, Menu, Row } from "antd";
import CreateBillStep from "component/header/create-bill-step";
import React from "react";
import { OrderStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropType = {
  isVisibleGroupButtons?: boolean;
  isVisibleActionsButtons?: boolean;
  stepsStatusValue?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
  orderActionsClick?: (type: string) => void;
};

const OrderDetailBottomBar: React.FC<PropType> = (props: PropType) => {
  const {
    isVisibleGroupButtons,
    isVisibleActionsButtons,
    stepsStatusValue,
    formRef,
    handleTypeButton,
    showSaveAndConfirmModal,
    orderActionsClick
  } = props;

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col
          md={10}
          style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
        >
          <CreateBillStep status={stepsStatusValue} orderDetail={null} />
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
                  console.log(
                    "formRef.current.value",
                    formRef?.current?.getFieldsValue()
                  );
                  formRef.current?.submit();
                }}
              >
                Lưu và Xác nhận
              </Button>
            </Col>
          )}
          {isVisibleActionsButtons && stepsStatusValue !== 'cancelled' &&(
            <Col md={10} style={{ marginTop: "8px" }}>
              <Dropdown
                // overlayStyle={{ minWidth: "15rem" }}
                getPopupContainer={trigger => trigger}
                overlay={
                  <Menu >
                    <Menu.Item
                      onClick={() => orderActionsClick && orderActionsClick('cancel')}
                      disabled={stepsStatusValue === OrderStatus.CANCELLED}
                    >
                      Huỷ đơn hàng
                    </Menu.Item>
                    <Menu.Item
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
                  In đơn hàng <DownOutlined />
                </Button>
              </Dropdown>
            </Col>
          )}  
      </Row>
    </StyledComponent>
  );
};

export default OrderDetailBottomBar;
