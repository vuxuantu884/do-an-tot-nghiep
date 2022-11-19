import { DownOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, FormInstance, Menu, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import CreateBillStep from "component/header/create-bill-step";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RootReducerType } from "model/reducers/RootReducerType";
// import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse } from "model/response/order/order.response";
import React, { Fragment, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { EcommerceChannelId } from "screens/ecommerce/common/commonAction";
import { isOrderFromPOS, sortFulfillments } from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { ORDER_SUB_STATUS } from "utils/Order.constants";
import {
  checkIfFulfillmentCancelled,
  checkIfOrderHasNotFinishPaymentMomo,
  isDeliveryOrderReturned,
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
  isVisibleGroupButtons?: boolean;
  isVisibleActionsButtons?: boolean;
  isVisibleUpdateButtons?: boolean;
  stepsStatusValue?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  isCreating?: boolean;
  isShowConfirmOrderButton?: boolean;
  disabledBottomActions?: boolean;
  isSaveDraft?: boolean;
  updating?: boolean;
  updatingConfirm?: boolean;
  isShow?: boolean;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
  orderActionsClick?: (type: string) => void;
  updateCancelClick?: () => void;
  deleteOrderClick?: () => void;
  onConfirmOrder?: () => void;
};

function OrderDetailBottomBar(props: PropTypes) {
  const {
    orderDetail,
    isVisibleGroupButtons,
    isVisibleActionsButtons,
    isVisibleUpdateButtons,
    stepsStatusValue,
    formRef,
    isCreating,
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
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount,
  );

  const acceptPermissionsUpdate = useCallback(() => {
    switch (stepsStatusValue) {
      case "packed":
        return [ORDER_PERMISSIONS.UPDATE_PACKED];
      case "shipping":
        return [ORDER_PERMISSIONS.UPDATE_SHIPPING];
      case "shipped":
        return [ORDER_PERMISSIONS.UPDATE_FINISHED];
      case "finalized":
        return [ORDER_PERMISSIONS.UPDATE_CONFIRMED];
      default:
        return [];
    }
  }, [stepsStatusValue]);
  const acceptPermissionsCancel = useCallback(() => {
    switch (stepsStatusValue) {
      case "packed":
        return [ORDER_PERMISSIONS.CANCEL_PACKED];
      case "finalized":
        return [ORDER_PERMISSIONS.CANCEL_CONFIRMED];
      default:
        return [];
    }
  }, [stepsStatusValue]);

  const isShowButtonCancelFFMAndUpdate = useMemo(() => {
    const sortedFulfillment = orderDetail?.fulfillments
      ? sortFulfillments(orderDetail?.fulfillments)
      : [];
    const checkIfOrderIsFinalized = () => {
      return orderDetail?.status !== OrderStatus.FINALIZED;
    };
    const checkIfOrderHasNoFFM = () => {
      if (!orderDetail || !orderDetail?.fulfillments || orderDetail?.fulfillments.length === 0) {
        return true;
      }
      if (checkIfFulfillmentCancelled(sortedFulfillment[0])) {
        return true;
      }
      return false;
    };
    const checkIfOrderStepIsUnshipped = () => {
      return orderDetail?.fulfillment_status === "unshipped";
    };
    const checkIfOrderFulfillmentHasNoShipment = () => {
      return !sortedFulfillment[0]?.shipment;
    };
    if (
      checkIfOrderIsFinalized() ||
      checkIfOrderHasNoFFM() ||
      !checkIfOrderStepIsUnshipped() ||
      checkIfOrderFulfillmentHasNoShipment()
    ) {
      return false;
    }
    return true;
  }, [orderDetail]);

  const checkIsFulfillmentShipping = useMemo(
    () => orderDetail?.fulfillments?.some((p) => p.status === FulFillmentStatus.SHIPPING),
    [orderDetail],
  );

  const isOrderHasNotFinishedAndNotExpiredPaymentMomo =
    checkIfOrderHasNotFinishPaymentMomo(orderDetail);

  console.log("orderDetail", orderDetail);

  const renderBottomBarLeft = () => {
    let content = null;
    if (!isOrderFromPOS(orderDetail)) {
      content = <CreateBillStep orderDetail={orderDetail} status={stepsStatusValue} />;
    }
    return <div className="bottomBar__left">{content}</div>;
  };

  const renderBottomBarRight = {
    pageCreateOrder() {
      let result = null;
      if (isVisibleGroupButtons && formRef && handleTypeButton && showSaveAndConfirmModal) {
        result = (
          <Col md={12}>
            <div className="bottomBarRight__content">
              <Button
                className="ant-btn-outline fixed-button cancle-button bottomBarRight__button"
                onClick={() => window.location.reload()}
                disabled={isSaveDraft || isCreating}
              >
                Huỷ
              </Button>
              <Button
                className="create-button-custom ant-btn-outline fixed-button bottomBarRight__button"
                type="primary"
                ghost
                onClick={showSaveAndConfirmModal}
                loading={isSaveDraft}
                disabled={isCreating || isLoadingDiscount}
                id="save-draft-confirm"
              >
                Lưu nháp (F6)
              </Button>
              <Button
                type="primary"
                className="create-button-custom 345 bottomBarRight__button"
                id="save-and-confirm"
                onClick={() => {
                  handleTypeButton(OrderStatus.FINALIZED);
                  formRef.current?.submit();
                }}
                loading={isCreating}
                disabled={isSaveDraft || isLoadingDiscount}
              >
                Lưu và Xác nhận (F9)
              </Button>
            </div>
          </Col>
        );
      }
      return result;
    },

    pageEditOrder() {
      let result = null;
      if (isVisibleUpdateButtons && formRef && handleTypeButton && showSaveAndConfirmModal) {
        result = (
          <Col md={12}>
            <div className="bottomBarRight__content">
              <Button
                className="ant-btn-outline fixed-button cancle-button bottomBarRight__button"
                onClick={() => updateCancelClick && updateCancelClick()}
                disabled={updating}
                id="btn-order-cancel"
              >
                Huỷ (F4)
              </Button>
              {stepsStatusValue === OrderStatus.DRAFT && (
                <Button
                  type="primary"
                  ghost
                  className="create-button-custom bottomBarRight__button"
                  id="save-and-confirm"
                  onClick={() => {
                    handleTypeButton(OrderStatus.FINALIZED);
                    formRef.current?.submit();
                  }}
                  disabled={isLoadingDiscount}
                  loading={updatingConfirm}
                >
                  Cập nhật và xác nhận
                </Button>
              )}
              <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                {(isPassed: boolean) => (
                  <Button
                    type="primary"
                    className="create-button-custom bottomBarRight__button"
                    id="btn-save-order-update"
                    onClick={() => {
                      formRef.current?.submit();
                    }}
                    loading={updating}
                    disabled={!isPassed || isLoadingDiscount}
                  >
                    Cập nhật đơn hàng (F9)
                  </Button>
                )}
              </AuthWrapper>
            </div>
          </Col>
        );
      }
      return result;
    },

    pageOrderDetail() {
      let result = null;
      if (isVisibleActionsButtons) {
        result = (
          <Col md={12} className="bottomBar__right">
            <Dropdown
              getPopupContainer={(trigger) => trigger}
              disabled={disabledBottomActions}
              overlay={
                <Menu>
                  <AuthWrapper acceptPermissions={acceptPermissionsCancel()} passThrough>
                    {(isPassed: boolean) => (
                      <Menu.Item
                        key="cancel"
                        onClick={() => orderActionsClick && orderActionsClick("cancel")}
                        disabled={
                          stepsStatusValue === FulFillmentStatus.SHIPPED ||
                          stepsStatusValue === FulFillmentStatus.SHIPPING ||
                          !isPassed ||
                          isDeliveryOrderReturned(orderDetail?.fulfillments) ||
                          isOrderHasNotFinishedAndNotExpiredPaymentMomo
                        }
                      >
                        Huỷ đơn hàng
                      </Menu.Item>
                    )}
                  </AuthWrapper>
                  <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.CREATE]} passThrough>
                    {(isPassed: boolean) => (
                      <Menu.Item
                        key="clone"
                        onClick={() => orderActionsClick && orderActionsClick("clone")}
                        // đơn hàng đổi trả không sao chép
                        disabled={
                          !isPassed ||
                          (orderDetail?.order_return_origin !== null &&
                            orderDetail?.order_return_origin !== undefined) ||
                          isOrderFromPOS(orderDetail)
                        }
                      >
                        Sao chép đơn hàng
                      </Menu.Item>
                    )}
                  </AuthWrapper>
                  {orderDetail &&
                  orderDetail?.fulfillments?.length &&
                  !orderDetail?.fulfillments[0]?.shipment?.tracking_code &&
                  orderDetail.status === "finalized" &&
                  orderDetail.channel_id === EcommerceChannelId.SHOPEE ? (
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
                        onClick={() =>
                          orderActionsClick && orderActionsClick("change_status_packed")
                        }
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
                    onClick={() =>
                      window.open(
                        `${UrlConfig.WARRANTY}/create?orderID=${orderDetail?.id}`,
                        "_blank",
                      )
                    }
                    disabled={orderDetail?.status !== OrderStatus.FINISHED}
                  >
                    Tạo bảo hành
                  </Menu.Item>
                  {!checkIsFulfillmentShipping && (
                    <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.DELETE_ORDER]} passThrough>
                      <Menu.Item
                        key="order_delete"
                        id="btn-order-delete"
                        onClick={deleteOrderClick}
                        style={{ color: "red" }}
                        disabled={isOrderHasNotFinishedAndNotExpiredPaymentMomo}
                      >
                        Xóa
                      </Menu.Item>
                    </AuthWrapper>
                  )}
                </Menu>
              }
              trigger={["click"]}
            >
              <Button className="bottomBarRight__button">
                Thêm thao tác <DownOutlined />
              </Button>
            </Dropdown>
            {isShowButtonCancelFFMAndUpdate ? (
              <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                {(isPassed: boolean) => (
                  <Button
                    // type="primary"
                    ghost
                    onClick={() =>
                      orderActionsClick && orderActionsClick("cancelFulfillmentAndUpdate")
                    }
                    className="bottomBarRight__button"
                    disabled={disabledBottomActions || !isPassed || isLoadingDiscount}
                  >
                    Hủy đơn giao & sửa đơn hàng
                  </Button>
                )}
              </AuthWrapper>
            ) : null}
            {/* {!checkIsFulfillmentShipping&&(
                    <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.DELETE_ORDER]} passThrough>
                    <Button
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                      danger id="btn-order-delete"
                      onClick={deleteOrderClick}
                    >
                      Xóa
                    </Button>
                  </AuthWrapper >
              )} */}
            {orderDetail?.sub_status_code &&
              orderDetail.sub_status_code !== ORDER_SUB_STATUS.returned && ( // đơn đã hoàn thì tạm thời ko hiển thị sửa đơn hàng
                <AuthWrapper acceptPermissions={acceptPermissionsUpdate()} passThrough>
                  {(isPassed: boolean) => (
                    <Button
                      type="primary"
                      ghost
                      className="bottomBarRight__button"
                      onClick={() => orderActionsClick && orderActionsClick("update")}
                      disabled={
                        disabledBottomActions ||
                        !isPassed ||
                        isLoadingDiscount ||
                        isOrderHasNotFinishedAndNotExpiredPaymentMomo
                      }
                      id="btn-order-edit"
                    >
                      Sửa đơn hàng (F9)
                    </Button>
                  )}
                </AuthWrapper>
              )}
            {isShowConfirmOrderButton && (
              <Button
                type="primary"
                className="bottomBarRight__button"
                onClick={onConfirmOrder}
                disabled={disabledBottomActions}
              >
                Xác nhận đơn
              </Button>
            )}
          </Col>
        );
      }
      return result;
    },
  };

  return (
    <StyledComponent>
      <div className="bottomBar" hidden={isShow}>
        <Row gutter={24}>
          <Col md={12}>{renderBottomBarLeft()}</Col>
          {renderBottomBarRight.pageCreateOrder()}
          {renderBottomBarRight.pageEditOrder()}
          {renderBottomBarRight.pageOrderDetail()}
        </Row>
      </div>
    </StyledComponent>
  );
}

export default OrderDetailBottomBar;
