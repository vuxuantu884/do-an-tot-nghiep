import { Fragment, useMemo } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, FormInstance, Menu, Row } from "antd";
// import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse } from "model/response/order/order.response";
import React, { useCallback } from "react";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { StyledComponent } from "./styles";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import { EcommerceChannelId } from "screens/ecommerce/common/commonAction";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { isOrderFromPOS, sortFulfillments } from "utils/AppUtils";
import CreateBillStep from "component/header/create-bill-step";
import UrlConfig from "config/url.config";
import { ORDER_SUB_STATUS } from "utils/Order.constants";

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
  isShow?:boolean;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
  orderActionsClick?: (type: string) => void;
  updateCancelClick?: () => void;
  deleteOrderClick?: () => void;
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
    isShow,
    handleTypeButton,
    showSaveAndConfirmModal,
    orderActionsClick,
    updateCancelClick,
    onConfirmOrder,
    deleteOrderClick,
  } = props;

  const isLoadingDiscount = useSelector(
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount
  );

  const acceptPermissionsUpdate = useCallback(() => {
    switch (stepsStatusValue) {
      case 'packed':
        return [ODERS_PERMISSIONS.UPDATE_PACKED];
      case 'shipping':
        return [ODERS_PERMISSIONS.UPDATE_SHIPPING]
      case 'shipped':
        return [ODERS_PERMISSIONS.UPDATE_FINISHED]
      case 'finalized':
        return [ODERS_PERMISSIONS.UPDATE_COMFIRMED]
      default: return []
    }
  }, [stepsStatusValue]);
  const acceptPermissionsCancel = useCallback(() => {
    switch (stepsStatusValue) {
      case 'packed':
        return [ODERS_PERMISSIONS.CANCEL_PACKED];
      case 'finalized':
        return [ODERS_PERMISSIONS.CANCEL_CONFIRMED]
      default: return []
    }
  }, [stepsStatusValue]);

  const isShowButtonCancelFFMAndUpdate = useMemo(() => {
    const sortedFulfillment = orderDetail?.fulfillments ? sortFulfillments(orderDetail?.fulfillments) : [];
    const checkIfOrderIsFinalized = () => {
      return orderDetail?.status !== OrderStatus.FINALIZED
    };
    const checkIfOrderHasNoFFM = () => {
      if(!orderDetail || !orderDetail?.fulfillments || orderDetail?.fulfillments.length === 0) {
        return true
      }
      if(sortedFulfillment[0].status === FulFillmentStatus.RETURNED || sortedFulfillment[0].status === FulFillmentStatus.CANCELLED || sortedFulfillment[0].status === FulFillmentStatus.RETURNING) {
        return true
      }
      return false
    };
    const checkIfOrderStepIsUnshipped = () => {
      return  orderDetail?.fulfillment_status === "unshipped"
    };
    const checkIfOrderFulfillmentHasNoShipment = () => {
      return  !sortedFulfillment[0]?.shipment
    };
    if(checkIfOrderIsFinalized() || checkIfOrderHasNoFFM() || !checkIfOrderStepIsUnshipped() || checkIfOrderFulfillmentHasNoShipment()) {
      return false;
    }
    return true
  }, [orderDetail])

  const checkIsFulfillmentShipping = useMemo(() => orderDetail?.fulfillments?.some((p) => p.status === FulFillmentStatus.SHIPPING), [orderDetail])

  return (
    <StyledComponent>
      <div className="bottomBar" hidden={isShow}>
        <Row gutter={24}>
          <Col md={12}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
              {!isOrderFromPOS(orderDetail) ? <CreateBillStep orderDetail={orderDetail} status={stepsStatusValue} /> : null}
            </div>
          </Col>
          {isVisibleGroupButtons &&
            formRef &&
            handleTypeButton &&
            showSaveAndConfirmModal && (
              <Col md={12} style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
                    disabled={creating || isLoadingDiscount}
                    id="save-draft-confirm"
                  >
                    Lưu nháp (F6)
                  </Button>
                  <Button
                    style={{ padding: "0 25px", fontWeight: 400 }}
                    type="primary"
                    className="create-button-custom 345"
                    id="save-and-confirm"
                    onClick={() => {
                      handleTypeButton(OrderStatus.FINALIZED);
                      formRef.current?.submit();
                    }}
                    loading={creating}
                    disabled={isSaveDraft || isLoadingDiscount}
                  >
                    Lưu và Xác nhận (F9)
                  </Button>
                </div>
              </Col>
            )}
          {isVisibleUpdateButtons &&
            formRef &&
            handleTypeButton &&
            showSaveAndConfirmModal && (
              <Col md={12} style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <Button
                    style={{ padding: "0 25px", fontWeight: 400 }}
                    className="ant-btn-outline fixed-button cancle-button"
                    onClick={() => updateCancelClick && updateCancelClick()}
                    disabled={updating}
                    id="btn-order-cancel"
                  >
                    Huỷ (F4)
                  </Button>
                  {!checkIsFulfillmentShipping&&(
                    <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.DELETE_ORDER]} passThrough>
                    <Button
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                      danger id="btn-order-delete"
                      onClick={deleteOrderClick}
                    >
                      Xóa
                    </Button>
                  </AuthWrapper >
                  )}
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
                    disabled={isLoadingDiscount}
                    loading={updatingConfirm}
                  >
                    Cập nhật và xác nhận
                  </Button>}
                  <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                    {(isPassed: boolean) =>
                      <Button
                        style={{ padding: "0 25px", fontWeight: 400 }}
                        type="primary"
                        className="create-button-custom"
                        id="btn-save-order-update"
                        onClick={() => {
                          formRef.current?.submit();
                        }}
                        loading={updating}
                        disabled={!isPassed || isLoadingDiscount}
                      >
                        Cập nhật đơn hàng (F9)
                    </Button>}
                  </AuthWrapper>

                </div>
              </Col>
            )}
          {isVisibleActionsButtons && (
            <Col md={12} className="bottomBar__right">
              <Dropdown
                getPopupContainer={(trigger) => trigger}
                disabled={disabledBottomActions}
                overlay={
                  <Menu>

                    <AuthWrapper acceptPermissions={acceptPermissionsCancel()} passThrough>
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
                          // đơn hàng đổi trả không sao chép
                          disabled={
                            !isPassed ||
                            (
                              orderDetail?.order_return_origin !== null
                              && orderDetail?.order_return_origin !== undefined
                            ) || isOrderFromPOS(orderDetail)
                          }
                        >
                          Sao chép đơn hàng
                      </Menu.Item>}
                    </AuthWrapper>
                    {orderDetail && orderDetail?.fulfillments?.length &&
                      !orderDetail?.fulfillments[0]?.shipment?.tracking_code &&
                      orderDetail.status === "finalized" && orderDetail.channel_id === EcommerceChannelId.SHOPEE ? (
                        <Menu.Item
                          key="confirm"
                          onClick={() => orderActionsClick && orderActionsClick("confirm")}
                        >
                          Xác nhận đơn trên sàn
                        </Menu.Item>
                      ) : null}
                    {orderDetail && orderDetail?.channel_id === EcommerceChannelId.LAZADA && (
                      <Fragment>
                        <Menu.Item
                          key="cochange_status_packednfirm"
                          onClick={() => orderActionsClick && orderActionsClick("change_status_packed")}
                        >
                          Tạo gói hàng Lazada
                      </Menu.Item>
                        <Menu.Item
                          key="change_status_rts"
                          onClick={() => orderActionsClick && orderActionsClick("change_status_rts")}
                        >
                          Báo Lazada sẵn sàng giao
                      </Menu.Item>
                      </Fragment>
                    )}
                    {stepsStatusValue === FulFillmentStatus.SHIPPED ? (
                      <Menu.Item
                        key="print"
                        onClick={() => orderActionsClick && orderActionsClick("print")}
                      >
                        In lại hoá đơn
                      </Menu.Item>
                    ) : null}
                    
                    <Menu.Item
                      key="warranty"
                      onClick={() => window.open(
                        `${UrlConfig.WARRANTY}/create?orderID=${orderDetail?.id}`,
                        '_blank' // <- This is what makes it open in a new window.
                      )}
                      disabled={orderDetail?.status !== OrderStatus.FINISHED}
                    >
                     Tạo bảo hành
                  </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}>
                  Thêm thao tác <DownOutlined />
                </Button>
              </Dropdown>
              {isShowButtonCancelFFMAndUpdate ? (
                <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                  {(isPassed: boolean) => 
                  <Button
                    // type="primary"
                    ghost
                    style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                    onClick={() => orderActionsClick && orderActionsClick("cancelFulfillmentAndUpdate")}
                    disabled={
                      disabledBottomActions ||
                      // orderDetail?.status === OrderStatus.FINISHED ||
                      // orderDetail?.status === OrderStatus.COMPLETED ||
                      // stepsStatusValue === OrderStatus.CANCELLED ||
                      !isPassed
                      || isLoadingDiscount
                    }
                  >
                    Hủy đơn giao & sửa đơn hàng
                  </Button>}
                </AuthWrapper>
              ) : null}
              {!checkIsFulfillmentShipping&&(
                    <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.DELETE_ORDER]} passThrough>
                    <Button
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                      danger id="btn-order-delete"
                      onClick={deleteOrderClick}
                    >
                      Xóa
                    </Button>
                  </AuthWrapper >
              )}
              {orderDetail?.sub_status_code && orderDetail.sub_status_code !== ORDER_SUB_STATUS.returned && ( // đơn đã hoàn thì tạm thời ko hiển thị sửa đơn hàng
                <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                  {(isPassed: boolean) => 
                  <Button
                    type="primary"
                    ghost
                    style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                    onClick={() => orderActionsClick && orderActionsClick("update")}
                    disabled={
                      disabledBottomActions ||
                      // orderDetail?.status === OrderStatus.FINISHED ||
                      // orderDetail?.status === OrderStatus.COMPLETED ||
                      // stepsStatusValue === OrderStatus.CANCELLED ||
                      !isPassed
                      || isLoadingDiscount
                    }
                    id="btn-order-edit"
                  >
                    Sửa đơn hàng (F9)
                  </Button>}
                </AuthWrapper>
              )}
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
