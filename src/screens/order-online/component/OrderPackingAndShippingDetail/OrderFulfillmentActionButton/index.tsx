import { Button } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { Link } from "react-router-dom";
import { checkIfOrderHasReturnedAll, isOrderFromPOS, sortFulfillments } from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus, ShipmentMethod } from "utils/Constants";
import {
  canCreateShipment, checkActiveCancelConfirmOrder, checkActiveCancelPackOrder,
  checkIfFulfillmentCancelled,
  checkIfFulfillmentReturning,
  checkIfOrderCancelled,
  checkIfOrderFinished,
  checkIfOrderHasNotFinishPaymentMomo,
  checkIfOrderIsCancelledBy3PL,
  checkIfOrderReturned,
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";
import { useSelector } from "react-redux";
import { RootReducerType } from "../../../../../model/reducers/RootReducerType";

type PropTypes = {
  stepsStatusValue: string | undefined;
  OrderDetailAllFulfillment: OrderResponse | null;
  cancelFulfillment: () => void;
  cancelShipment: boolean;
  updateShipment: boolean;
  onOkShippingConfirm: () => void;
  allowCreatePicked: boolean;
  allowCreatePacked: boolean;
  allowCreateShipping: boolean;
  setIsVisibleShippedConfirm: (value: boolean) => void;
  setIsVisibleShippingConfirm: (value: boolean) => void;
  isVisibleShipping: boolean | null;
  ShowShipping: () => void;
  disabledBottomActions: boolean | undefined;
};

function OrderFulfillmentActionButton(props: PropTypes) {
  const {
    stepsStatusValue,
    OrderDetailAllFulfillment,
    cancelFulfillment,
    cancelShipment,
    updateShipment,
    onOkShippingConfirm,
    allowCreatePicked,
    allowCreatePacked,
    allowCreateShipping,
    setIsVisibleShippedConfirm,
    setIsVisibleShippingConfirm,
    isVisibleShipping,
    ShowShipping,
    // disabledBottomActions,
  } = props;

  const sortedFulfillments = sortFulfillments(OrderDetailAllFulfillment?.fulfillments);
  let permissionsAccount = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const renderOrderReturnButtons = () => {
    return (
      <React.Fragment>
        {!isOrderFromPOS(OrderDetailAllFulfillment) ? (
          <React.Fragment>
            <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.orders_return_online]} passThrough>
              {(isPassed: boolean) => (
                <Link
                  to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=online`}
                  title={
                    !isPassed ? "Tài khoản không được cấp quyền trả lại chuyển hàng online" : ""
                  }
                >
                  <Button
                    type="primary"
                    style={{ margin: "0 10px", padding: "0 25px" }}
                    className="create-button-custom ant-btn-outline fixed-button"
                    disabled={!isPassed}
                  >
                    Trả lại chuyển hàng
                  </Button>
                </Link>
              )}
            </AuthWrapper>
            <AuthWrapper
              acceptPermissions={[ORDER_PERMISSIONS.orders_return_at_the_store]}
              passThrough
            >
              {(isPassed: boolean) => (
                <Link
                  to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=offline`}
                  title={!isPassed ? "Tài khoản không được cấp quyền trả tại quầy online" : ""}
                >
                  <Button
                    type="primary"
                    style={{ margin: "0 10px", padding: "0 25px" }}
                    className="create-button-custom ant-btn-outline fixed-button"
                    disabled={!isPassed}
                  >
                    Trả lại tại quầy
                  </Button>
                </Link>
              )}
            </AuthWrapper>
          </React.Fragment>
        ) : (
          <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.orders_return_offline]} passThrough>
            {(isPassed: boolean) => (
              <Link
                to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=offline`}
                title={!isPassed ? "Tài khoản không được cấp quyền đổi trả hàng offline" : ""}
              >
                <Button
                  type="primary"
                  style={{ padding: "0 25px" }}
                  className="create-button-custom ant-btn-outline fixed-button"
                  disabled={!isPassed}
                >
                  Đổi trả hàng
                </Button>
              </Link>
            )}
          </AuthWrapper>
        )}
      </React.Fragment>
    );
  };

  const renderIfOrderFinished = () => {
    if (!checkIfOrderHasReturnedAll(OrderDetailAllFulfillment)) {
      return renderOrderReturnButtons();
    } else {
      return (
        <Button
          type="primary"
          style={{ margin: "0 10px", padding: "0 25px" }}
          className="create-button-custom ant-btn-outline fixed-button"
          disabled
        >
          Đơn hàng đã đổi trả hàng hết!
        </Button>
      );
    }
  };

  const renderIfOrderNotFinished = () => {
    if (sortedFulfillments.length === 0 || checkIfFulfillmentCancelled(sortedFulfillments[0])) {
      return null;
    }
    if (
      sortedFulfillments[0]?.shipment?.delivery_service_provider_type ===
      ShipmentMethod.EXTERNAL_SERVICE &&
      OrderDetailAllFulfillment?.fulfillment_status === FulFillmentStatus.SHIPPING
    ) {
      return null;
    }
    return (
      <Button
        onClick={cancelFulfillment}
        loading={cancelShipment}
        disabled={checkActiveCancelConfirmOrder(OrderDetailAllFulfillment, permissionsAccount) || checkActiveCancelPackOrder(OrderDetailAllFulfillment, permissionsAccount)}
        type="default"
        className="create-button-custom ant-btn-outline fixed-button saleorder_shipment_cancel_btn"
        style={{
          // color: "#737373",
          border: "1px solid #E5E5E5",
          padding: "0 25px",
        }}
      >
        {sortedFulfillments[0]?.shipment?.delivery_service_provider_type ===
        ShipmentMethod.PICK_AT_STORE
          ? "Hủy"
          : "Hủy đơn giao"}
      </Button>
    );
  };

  const renderButtonStepAction = () => {
    // console.log('stepsStatusValue', stepsStatusValue)
    if (sortedFulfillments.length === 0 || checkIfFulfillmentCancelled(sortedFulfillments[0])) {
      return null;
    }
    switch (stepsStatusValue) {
      case OrderStatus.FINALIZED:
        if (
          sortedFulfillments[0]?.shipment?.delivery_service_provider_type !==
          ShipmentMethod.PICK_AT_STORE
        ) {
          return (
            <Button
              type="primary"
              style={{ marginLeft: "10px", padding: "0 25px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              id="btn-go-to-pack"
              onClick={onOkShippingConfirm}
              loading={updateShipment}
              disabled={cancelShipment || !allowCreatePicked}
            >
              Nhặt hàng
            </Button>
          );
        } else {
          return (
            <Button
              type="primary"
              style={{ marginLeft: "10px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              onClick={onOkShippingConfirm}
              loading={updateShipment}
              disabled={cancelShipment || !(allowCreatePicked || allowCreatePacked)}
            >
              Nhặt hàng & đóng gói
            </Button>
          );
        }

      case FulFillmentStatus.PICKED:
        return (
          <Button
            type="primary"
            className="create-button-custom ant-btn-outline fixed-button"
            style={{ marginLeft: "10px" }}
            onClick={onOkShippingConfirm}
            loading={updateShipment}
            disabled={cancelShipment || !allowCreatePacked}
          >
            Đóng gói
          </Button>
        );

      case FulFillmentStatus.PACKED:
        if (!sortedFulfillments[0]?.shipment) {
          return;
        }
        if (
          sortedFulfillments[0]?.shipment?.delivery_service_provider_type !==
          ShipmentMethod.PICK_AT_STORE
        ) {
          return (
            <Button
              type="primary"
              style={{ marginLeft: "10px", padding: "0 25px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              onClick={() => setIsVisibleShippingConfirm(true)}
              loading={updateShipment}
              disabled={cancelShipment || !allowCreateShipping}
            >
              Xuất kho
            </Button>
          );
        } else {
          return (
            <Button
              type="primary"
              style={{ marginLeft: "10px", padding: "0 25px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              onClick={() => setIsVisibleShippedConfirm(true)}
              loading={updateShipment}
              disabled={cancelShipment || !allowCreateShipping}
            >
              Xuất kho & giao hàng
            </Button>
          );
        }

      case FulFillmentStatus.SHIPPING:
        if (checkIfFulfillmentCancelled(sortedFulfillments[0])) {
          // return;
        }
        return (
          <Button
            type="primary"
            style={{
              marginLeft: "10px",
              backgroundColor: "#FCAF17",
              borderColor: "#FCAF17",
            }}
            className="create-button-custom ant-btn-outline fixed-button"
            onClick={() => setIsVisibleShippedConfirm(true)}
            loading={updateShipment}
            disabled={cancelShipment}
          >
            Đã giao hàng
          </Button>
        );
      default:
        break;
    }
  };

  const checkIfShowButtonShipping = () => {
    return (
      isVisibleShipping === false &&
      (canCreateShipment(props?.OrderDetailAllFulfillment?.fulfillments) ||
        checkIfOrderReturned(OrderDetailAllFulfillment) ||
        checkIfOrderIsCancelledBy3PL(OrderDetailAllFulfillment)) &&
      !isOrderFromPOS(OrderDetailAllFulfillment) &&
      !checkIfOrderCancelled(OrderDetailAllFulfillment) &&
      !checkIfFulfillmentReturning(sortedFulfillments[0])
    );
  };

  return (
    <StyledComponent>
      <div className="buttonActionWrapper 656">
        {checkIfOrderFinished(OrderDetailAllFulfillment)
          ? renderIfOrderFinished()
          : renderIfOrderNotFinished()}
        {renderButtonStepAction()}

        {checkIfShowButtonShipping() && (
          <Button
            type="primary"
            className="ant-btn-outline fixed-button text-right 555"
            style={{
              float: "right",
              padding: "0 25px",
              marginLeft: "10px",
            }}
            onClick={ShowShipping}
            loading={updateShipment}
            disabled={checkIfOrderHasNotFinishPaymentMomo(OrderDetailAllFulfillment)}
          >
            Giao hàng
          </Button>
        )}
      </div>
    </StyledComponent>
  );
}

export default OrderFulfillmentActionButton;
