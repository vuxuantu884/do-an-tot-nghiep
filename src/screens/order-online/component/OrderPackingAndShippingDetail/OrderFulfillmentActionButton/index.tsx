import { Button } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { Link } from "react-router-dom";
import {
  checkIfOrderHasReturnedAll,
  isOrderFromPOS,
  sortFulfillments
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  ShipmentMethod
} from "utils/Constants";
import {
  checkIfFulfillmentCancelled, checkIfFulfillmentReturning, checkIfOrderCancelled, checkIfOrderFinished, checkIfOrderIsCancelledBy3PL,
  checkIfOrderReturned,
  isDeliveryOrder
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";

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
  setIsvibleShippedConfirm: (value: boolean) => void;
  setIsvibleShippingConfirm: (value: boolean) => void;
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
    setIsvibleShippedConfirm,
    setIsvibleShippingConfirm,
    isVisibleShipping,
    ShowShipping,
    // disabledBottomActions,
  } = props;

  const sortedFulfillments = sortFulfillments(
    OrderDetailAllFulfillment?.fulfillments,
  );

  const checkIfFulfillmentStatusIsCancel = () => {
    return OrderDetailAllFulfillment?.fulfillments?.some(
      (single) => single.status !== FulFillmentStatus.CANCELLED,
    );
  };

  const isShowButtonCancelFulfillment = () => {
    if (checkIfFulfillmentStatusIsCancel()) {
      return true;
    }
    // kiểm tra có phải là đơn đang hoàn
    if (
      sortedFulfillments[0]?.status === FulFillmentStatus.SHIPPING &&
      sortedFulfillments[0]?.return_status !== FulFillmentStatus.RETURNING
    ) {
      return true;
    }
    return false;
  };

  console.log("isShowButtonCancelFulfillment", isShowButtonCancelFulfillment());
  console.log(
    "checkIfOrderFinished(OrderDetailAllFulfillment)",
    checkIfOrderFinished(OrderDetailAllFulfillment),
  );

  const renderOrderReturnButtons = () => {
    return (
      <AuthWrapper
        acceptPermissions={[ODERS_PERMISSIONS.CREATE_RETURN]}
        passThrough
      >
        {(isPassed: boolean) => {
          return (
            <React.Fragment>
              {!isOrderFromPOS(OrderDetailAllFulfillment) ? (
                <React.Fragment>
                  <Link
                    to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=online`}
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
                  <Link
                    to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=offline`}
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
                </React.Fragment>
              ) : (
                <Link
                  to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetailAllFulfillment?.id}&type=offline`}
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
            </React.Fragment>
          );
        }}
      </AuthWrapper>
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
    if (
      sortedFulfillments.length === 0 ||
      checkIfFulfillmentCancelled(sortedFulfillments[0])
    ) {
      return null;
    }
    return (
      <Button
        onClick={cancelFulfillment}
        loading={cancelShipment}
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
    switch (stepsStatusValue) {
      case OrderStatus.FINALIZED:
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
              disabled={
                cancelShipment || !(allowCreatePicked || allowCreatePacked)
              }
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
              onClick={() => setIsvibleShippingConfirm(true)}
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
              onClick={() => setIsvibleShippedConfirm(true)}
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
            onClick={() => setIsvibleShippedConfirm(true)}
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
      (isDeliveryOrder(props?.OrderDetailAllFulfillment?.fulfillments) ||
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
            className="ant-btn-outline fixed-button text-right"
            style={{
              float: "right",
              padding: "0 25px",
              marginLeft: "10px",
            }}
            onClick={ShowShipping}
            loading={updateShipment}
          >
            Giao hàng
          </Button>
        )}
      </div>
    </StyledComponent>
  );
}

export default OrderFulfillmentActionButton;
