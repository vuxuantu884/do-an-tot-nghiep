import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, FormInstance, Menu, Row } from "antd";
import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { StyledComponent } from "./styles";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";

type PropType = {
  orderDetail?: OrderResponse | null;
  isVisibleGroupButtons?: boolean;
  isVisibleActionsButtons?: boolean;
  isVisibleUpdateButtons?: boolean;
  stepsStatusValue?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  creating?: boolean;
  isShowConfirmOrderButton?: boolean;
  disabledBottomActions?: boolean;
  isSaveDraft?: boolean;
  updating?: boolean;
  updatingConfirm?: boolean;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
  orderActionsClick?: (type: string) => void;
  updateCancelClick?: () => void;
  onConfirmOrder?: () => void;
};

const OrderDetailBottomBar: React.FC<PropType> = (props: PropType) => {
  const {
    orderDetail,
    isVisibleGroupButtons,
    isVisibleActionsButtons,
    isVisibleUpdateButtons,
    stepsStatusValue,
    formRef,
    creating,
    isSaveDraft,
    updating,
    updatingConfirm,
    isShowConfirmOrderButton,
    disabledBottomActions,
    handleTypeButton,
    showSaveAndConfirmModal,
    orderActionsClick,
    updateCancelClick,
    onConfirmOrder,
  } = props;

  return (
    <StyledComponent>
      <div className="bottomBar">
        <Row gutter={24}>
          <Col md={12}>
            <CreateBillStep orderDetail={orderDetail} status={stepsStatusValue} />
          </Col>
          {isVisibleGroupButtons &&
            formRef &&
            handleTypeButton &&
            showSaveAndConfirmModal && (
              <Col md={12} style={{ marginTop: "8px" }}>
                <Button
                  style={{ padding: "0 25px", fontWeight: 400 }}
                  className="ant-btn-outline fixed-button cancle-button"
                  onClick={() => window.location.reload()}
                  disabled={isSaveDraft || creating}
                >
                  Huỷ
                </Button>
                <Button
                  style={{ padding: "0 25px", fontWeight: 400 }}
                  className="create-button-custom ant-btn-outline fixed-button"
                  type="primary"
                  ghost
                  onClick={showSaveAndConfirmModal}
                  loading={isSaveDraft}
                  disabled={creating}
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
                    // console.log(
                    //   "formRef.current.value",
                    //   formRef?.current?.getFieldsValue()
                    // );
                    formRef.current?.submit();
                  }}
                  loading={creating}
                  disabled={isSaveDraft}
                >
                  Lưu và Xác nhận
                </Button>
              </Col>
            )}
          {isVisibleUpdateButtons &&
            formRef &&
            handleTypeButton &&
            showSaveAndConfirmModal && (
              <Col md={12} style={{ marginTop: "8px" }}>
                <Button
                  style={{ padding: "0 25px", fontWeight: 400 }}
                  className="ant-btn-outline fixed-button cancle-button"
                  onClick={() => updateCancelClick && updateCancelClick()}
                  disabled={updating}
                >
                  Huỷ
                </Button>
                {stepsStatusValue === OrderStatus.DRAFT && <Button
                  style={{ padding: "0 25px", fontWeight: 400 }}
                  type="primary"
                  ghost
                  className="create-button-custom"
                  id="save-and-confirm"
                  onClick={() => {
                    handleTypeButton(OrderStatus.FINALIZED);
                    formRef.current?.submit();
                  }}
                  loading={updatingConfirm}
                >
                  Cập nhật và xác nhận
                </Button>}
                <Button
                  style={{ padding: "0 25px", fontWeight: 400 }}
                  type="primary"
                  className="create-button-custom"
                  id="save-and-confirm"
                  onClick={() => {
                    // handleTypeButton(OrderStatus.FINALIZED);
                    formRef.current?.submit();
                  }}
                  loading={updating}
                >
                  Cập nhật đơn hàng
                </Button>
              </Col>
            )}
          {isVisibleActionsButtons && (
            <Col md={12} style={{ marginTop: "8px" }}>
              <Dropdown
                // overlayStyle={{ minWidth: "15rem" }}
                getPopupContainer={(trigger) => trigger}
                disabled={disabledBottomActions}
                overlay={
                  <Menu>
                    {/* <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.UPDATE]} passThrough>
                      {(isPassed: boolean) => 
                      <Menu.Item
                        key="update"
                        onClick={() => orderActionsClick && orderActionsClick("update")}
                        disabled={
                          stepsStatusValue === OrderStatus.CANCELLED ||
                          stepsStatusValue === FulFillmentStatus.SHIPPED ||
                          stepsStatusValue === FulFillmentStatus.SHIPPING || !isPassed
                        }
                      >
                        Sửa đơn hàng
                      </Menu.Item>}
                    </AuthWrapper> */}
                    <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CANCEL]} passThrough>
                      {(isPassed: boolean) => 
                      <Menu.Item
                        key="cancel"
                        onClick={() => orderActionsClick && orderActionsClick("cancel")}
                        disabled={
                          stepsStatusValue === OrderStatus.CANCELLED ||
                          stepsStatusValue === FulFillmentStatus.SHIPPED ||
                          stepsStatusValue === FulFillmentStatus.SHIPPING || !isPassed
                        }
                      >
                        Huỷ đơn hàng
                      </Menu.Item>}
                    </AuthWrapper>
                    <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                      {(isPassed: boolean) => 
                      <Menu.Item
                        key="clone"
                        onClick={() => orderActionsClick && orderActionsClick("clone")}
                        disabled={!isPassed}
                      >
                        Sao chép đơn hàng
                      </Menu.Item>}
                    </AuthWrapper>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}>
                  Thêm thao tác <DownOutlined />
                </Button>
              </Dropdown>
              {/* <Dropdown
                // overlayStyle={{ minWidth: "15rem" }}
                getPopupContainer={(trigger) => trigger}
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() =>
                        props.orderActionsClick && props.orderActionsClick("print")
                      }
                    >
                      In nhanh
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        props.orderActionsClick && props.orderActionsClick("print")
                      }
                    >
                      In tuỳ chọn
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  type="primary"
                  ghost
                  style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                >
                  <img src={IconPrint} alt="" style={{ paddingRight: "10px" }} /> In đơn
                  hàng
                </Button>
              </Dropdown> */}
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.UPDATE]} passThrough>
                {(isPassed: boolean) => 
                <Button
                  type="primary"
                  ghost
                  style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                  onClick={() => orderActionsClick && orderActionsClick("update")}
                  disabled={
                    disabledBottomActions ||
                    stepsStatusValue === OrderStatus.CANCELLED || !isPassed
                    // || stepsStatusValue === FulFillmentStatus.SHIPPED
                    // || stepsStatusValue === FulFillmentStatus.SHIPPING
                  }
                >
                  Sửa đơn hàng
                </Button>}
              </AuthWrapper>
              {isShowConfirmOrderButton && (
                <Button
                  type="primary"
                  style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                  onClick={onConfirmOrder}
                  disabled={disabledBottomActions}
                >
                  Xác nhận đơn
                </Button>
              )}
            </Col>
          )}
        </Row>
      </div>
    </StyledComponent>
  );
};

export default OrderDetailBottomBar;
