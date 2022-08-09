import { Button, Checkbox, Col, DatePicker, Form, FormInstance, Row, Select, Space } from "antd";
import DeliverPartnerOutline from "component/icon/DeliverPartnerOutline";
import PickAtStoreOutline from "component/icon/PickAtStoreOutline";
import SelfDeliverOutline from "component/icon/SelfDeliverOutline";
import WallClockOutline from "component/icon/WallClockOutline";
import ShipmentMethodEcommerce from "component/order/OrderCreateShipment/ShipmentMethodEcommerce";
import ShipmentMethodReceiveAtStore from "component/order/OrderCreateShipment/ShipmentMethodReceiveAtStore";
import { getFeesAction } from "domain/actions/order/order.action";
import { thirdPLModel } from "model/order/shipment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderLineItemRequest, OrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  EcommerceDeliveryResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFetchDeliverServices from "screens/order-online/hooks/useFetchDeliverServices";
import useFetchExternalShippers from "screens/order-online/hooks/useFetchExternalShippers";
import {
  getShippingAddressDefault,
  handleCalculateShippingFeeApplyOrderSetting,
  isOrderFinishedOrCancel,
  SumWeight,
} from "utils/AppUtils";
import { ShipmentMethodOption, SHIPPING_REQUIREMENT } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import {
  checkIfExpiredOrCancelledPayment,
  checkIfFinishedPayment,
  checkIfMomoPayment,
} from "utils/OrderUtils";
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
import ShipmentMethodSelfDelivery from "./ShipmentMethodSelfDelivery";
import { StyledComponent } from "./styles";

// shipment button action
type ShipmentButtonType = {
  name: string | null;
  value: number;
  icon?: string;
  isDisabled?: boolean;
};

type PropTypes = {
  shipmentMethod: number;
  orderProductsAmount?: number;
  storeDetail: StoreCustomResponse | undefined;
  customer: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  levelOrder?: number;
  isCancelValidateDelivery: boolean;
  totalAmountCustomerNeedToPay?: number;
  form: FormInstance<any>;
  thirdPL?: thirdPLModel;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  isShowButtonCreateShipment?: boolean;
  onSelectShipment: (value: number) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  handleCreateShipment?: () => void;
  creating?: boolean;
  isOrderReturnFromPOS?: boolean;
  handleCancelCreateShipment?: () => void;
  ecommerceShipment?: EcommerceDeliveryResponse | null;
  isEcommerceOrder?: boolean;
  isPageOrderUpdate?: boolean;
  isPageOrderDetail?: boolean;
  OrderDetail?: OrderResponse | null;
  orderConfig: OrderConfigResponseModel | null;
  payments?: OrderPaymentRequest[];
};

/**
 * component dùng trong trang tạo đơn, chi tiết đơn hàng (đơn nháp), update đơn hàng, đổi trả đơn hàng
 *
 * isCancelValidateDelivery: ko validate khi tạo đơn nháp
 *
 * shipmentMethod: truyền giá trị mặc định
 *
 * orderProductsAmount: giá trị đơn hàng, để tính phí ship hãng vận chuyển, khi apply cấu hình đơn hàng
 *
 * items: hàng hóa trong đơn hàng, để tính phí ship
 *
 * totalAmountCustomerNeedToPay: tổng số tiền thu hộ - bằng số tiền khách cần trả
 *
 * onSelectShipment: xử lý khi chọn loại shipment
 *
 * setShippingFeeInformedToCustomer: xử lý khi điền phí ship báo khách
 *
 * thirdPL: thông tin mặc định hãng vận chuyển, khi clone
 *
 * setThirdPL: xử lý khi chọn hãng vận chuyển
 *
 * form: xử lý form
 *
 * customer: thông tin khách hàng - tính phí ship
 *
 * storeDetail: thông tin cửa hàng - tính phí ship
 *
 * isShowButtonCreateShipment: hiển thị button tạo đơn giao hàng trong chi tiết đơn hàng khi tạo đơn hàng chọn giao hàng sau
 *
 * handleCreateShipment: xử lý khi click nút tạo đơn giao hàng trong chi tiết đơn hàng khi tạo đơn hàng chọn giao hàng sau
 *
 * creating: loading status create
 *
 * handleCancelCreateShipment: xử lý khi click nút hủy trong chi tiết đơn hàng khi tạo đơn hàng chọn giao hàng sau
 */
function OrderCreateShipment(props: PropTypes) {
  const {
    customer,
    storeDetail,
    items,
    orderProductsAmount,
    shipmentMethod,
    levelOrder = 0,
    totalAmountCustomerNeedToPay = 0,
    form,
    isCancelValidateDelivery,
    thirdPL,
    isShowButtonCreateShipment = false,
    shippingServiceConfig,
    orderConfig,
    setThirdPL,
    onSelectShipment,
    setShippingFeeInformedToCustomer,
    handleCreateShipment,
    creating,
    handleCancelCreateShipment,
    ecommerceShipment,
    isEcommerceOrder,
    isPageOrderUpdate,
    OrderDetail,
    isOrderReturnFromPOS,
    payments,
    isPageOrderDetail,
  } = props;

  const dateFormat = DATE_FORMAT.DDMMYYY;

  const shippingAddressDefault = getShippingAddressDefault(customer);

  const dispatch = useDispatch();
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");

  const externalShippers = useFetchExternalShippers();

  const deliveryServices = useFetchDeliverServices();

  const ShipMethodOnChange = (value: number) => {
    onSelectShipment(value);
    // setShippingFeeInformedToCustomer(0);
    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      setThirdPL({
        delivery_service_provider_code: "",
        delivery_service_provider_id: null,
        insurance_fee: null,
        delivery_service_provider_name: "",
        delivery_transport_type: "",
        service: "",
        shipping_fee_paid_to_three_pls: null,
      });
    }
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement,
  );

  const shipmentButton: Array<ShipmentButtonType> = [
    {
      name: "Chuyển hãng vận chuyển",
      value: ShipmentMethodOption.DELIVER_PARTNER,
      // icon: IconDelivery,
      isDisabled: isOrderReturnFromPOS,
    },
    {
      name: "Tự giao hàng",
      value: ShipmentMethodOption.SELF_DELIVER,
      // icon: IconSelfDelivery,
      isDisabled: isOrderReturnFromPOS,
    },
    {
      name: "Nhận tại cửa hàng",
      value: ShipmentMethodOption.PICK_AT_STORE,
      // icon: IconShoppingBag,
      isDisabled: false,
    },
    {
      name: "Giao hàng sau",
      value: ShipmentMethodOption.DELIVER_LATER,
      // icon: IconWallClock,
      isDisabled: isOrderReturnFromPOS,
    },
  ];
  const checkIfDisableSelectShipment = () => {
    return (
      isOrderFinishedOrCancel(OrderDetail) ||
      payments?.some((payment) => {
        return (
          checkIfMomoPayment(payment) &&
          payment.paid_amount > 0 &&
          !checkIfExpiredOrCancelledPayment(payment) &&
          !checkIfFinishedPayment(payment)
        );
      })
    );
  };

  const renderShipmentTabHeader = () => {
    return (
      <React.Fragment>
        {shipmentButton.map((button) => {
          let color = shipmentMethod === button.value ? primaryColor : undefined;
          const ShipmentTabHeaderButton = {
            [ShipmentMethodOption.DELIVER_PARTNER]: <DeliverPartnerOutline color={color} />,
            [ShipmentMethodOption.SELF_DELIVER]: <SelfDeliverOutline color={color} />,
            [ShipmentMethodOption.PICK_AT_STORE]: <PickAtStoreOutline color={color} />,
            [ShipmentMethodOption.DELIVER_LATER]: <WallClockOutline color={color} />,
          };
          let icon = ShipmentTabHeaderButton[button.value];
          return (
            <div key={button.value}>
              {shipmentMethod !== button.value ? (
                <div
                  className={`saleorder_shipment_button ${button.isDisabled ? "disabled" : ""}`}
                  key={button.value}
                  style={checkIfDisableSelectShipment() ? { pointerEvents: "none" } : undefined}
                  onClick={() => {
                    levelOrder < 4 && !button.isDisabled && ShipMethodOnChange(button.value);
                    if (
                      items?.length &&
                      items?.length > 0 &&
                      button.value === 2 &&
                      !isPageOrderDetail
                    ) {
                      handleCalculateShippingFeeApplyOrderSetting(
                        shippingAddressDefault?.city_id,
                        orderProductsAmount,
                        shippingServiceConfig,
                        undefined,
                        form,
                        setShippingFeeInformedToCustomer,
                        isPageOrderUpdate,
                      );
                    }
                    if (button.value === ShipmentMethodOption.PICK_AT_STORE) {
                      setShippingFeeInformedToCustomer(0);
                    }
                  }}
                >
                  {icon}
                  <span>{button.name}</span>
                </div>
              ) : (
                <div
                  className={
                    shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                      ? "saleorder_shipment_button border 11"
                      : "saleorder_shipment_button active 22"
                  }
                  key={button.value}
                  style={checkIfDisableSelectShipment() ? { pointerEvents: "none" } : undefined}
                >
                  {icon}
                  <span>{button.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  const renderButtonCreateActionHtml = () => {
    if (isShowButtonCreateShipment) {
      return (
        <div className="createShipment">
          <Button
            type="primary"
            className="create-button-custom createShipment__button 88"
            onClick={() => {
              handleCreateShipment && handleCreateShipment();
            }}
            loading={creating}
          >
            Tạo đơn giao hàng
          </Button>
          <Button
            className="createShipment__button"
            onClick={() => {
              handleCancelCreateShipment && handleCancelCreateShipment();
            }}
            disabled={creating}
          >
            Hủy
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderIfOrderIsEcommerce = () => {
    if (isEcommerceOrder) {
      return (
        <ShipmentMethodEcommerce
          ecommerceShipment={ecommerceShipment}
          OrderDetail={OrderDetail}
          handleCreateShipment={handleCreateShipment}
          setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
          isLoading={creating}
          isPageOrderUpdate={isPageOrderUpdate}
        />
      );
    }
  };

  const renderCreateShipmentTop = () => {
    return (
      <Row gutter={24}>
        <Col md={9}>
          <span className="orders-shipment__dateLabel">Hẹn giao:</span>
          <Form.Item name="dating_ship">
            <DatePicker
              format={dateFormat}
              style={{ width: "100%" }}
              className="r-5 w-100 ip-search"
              placeholder={dateFormat}
              disabledDate={(current: any) => moment().add(-1, "days") >= current}
              disabled={isOrderFinishedOrCancel(OrderDetail)}
            />
          </Form.Item>
        </Col>

        <Col md={6}>
          <Form.Item name="office_time" valuePropName="checked">
            <Checkbox className="officeTime 78" disabled={isOrderFinishedOrCancel(OrderDetail)}>
              Giờ hành chính
            </Checkbox>
          </Form.Item>
        </Col>
        <Col md={9}>
          <span className="orders-shipment__dateLabel">Yêu cầu:</span>
          <Form.Item name="requirements">
            <Select
              className="select-with-search"
              showSearch
              showArrow
              notFoundContent="Không tìm thấy kết quả"
              style={{ width: "100%" }}
              placeholder="Chọn yêu cầu"
              disabled={orderConfig?.for_all_order || isOrderFinishedOrCancel(OrderDetail)}
              filterOption={(input, option) => {
                if (option) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
            >
              {shipping_requirements?.map((item, index) => (
                <Select.Option style={{ width: "100%" }} key={index.toString()} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    );
  };

  const renderCreateShipmentDetail = () => {
    const shipmentDetail = {
      // Chuyển hãng vận chuyển
      [ShipmentMethodOption.DELIVER_PARTNER]: (
        <ShipmentMethodDeliverPartner
          totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
          thirdPL={thirdPL}
          setThirdPL={setThirdPL}
          shippingServiceConfig={shippingServiceConfig}
          setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
          deliveryServices={deliveryServices}
          infoFees={infoFees}
          addressError={addressError}
          levelOrder={levelOrder}
          orderProductsAmount={orderProductsAmount}
          customer={customer}
          form={form}
          renderButtonCreateActionHtml={renderButtonCreateActionHtml}
        />
      ),
      // Tự vận chuyển
      [ShipmentMethodOption.SELF_DELIVER]: (
        <ShipmentMethodSelfDelivery
          totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
          levelOrder={levelOrder}
          isCancelValidateDelivery={isCancelValidateDelivery}
          storeId={storeDetail?.id}
          renderButtonCreateActionHtml={renderButtonCreateActionHtml}
          thirdPL={thirdPL}
          setThirdPL={setThirdPL}
          externalShippers={externalShippers}
          form={form}
        />
      ),
      // Nhận tại cửa hàng
      [ShipmentMethodOption.PICK_AT_STORE]: (
        <ShipmentMethodReceiveAtStore
          storeDetail={storeDetail}
          isCancelValidateDelivery={isCancelValidateDelivery}
          renderButtonCreateActionHtml={renderButtonCreateActionHtml}
        />
      ),
    };
    const content = shipmentDetail[shipmentMethod] || null;
    return (
      <div
        className="saleorder_shipment_method_content"
        style={
          shipmentMethod !== ShipmentMethodOption.DELIVER_LATER ? { marginTop: 15 } : undefined
        }
      >
        {content}
      </div>
    );
  };

  const renderIfOrderIsNotEcommerce = () => {
    if (!isEcommerceOrder) {
      return (
        <div className="orders-shipment 432">
          {renderCreateShipmentTop()}
          <Row>
            <div
              className="saleorder_shipment_method_btn 2"
              style={
                shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                  ? { border: "none" }
                  : { borderBottom: "1px solid #2A2A86" }
              }
            >
              <Space size={10} align="start">
                {renderShipmentTabHeader()}
              </Space>
            </div>
          </Row>
          {renderCreateShipmentDetail()}
        </div>
      );
    }
  };

  useEffect(() => {
    if (
      customer &&
      storeDetail &&
      (shippingAddressDefault?.city_id || shippingAddressDefault?.district_id) &&
      shippingAddressDefault?.ward_id &&
      shippingAddressDefault?.full_address &&
      items &&
      items?.length > 0
    ) {
      if (
        !(
          (storeDetail.city_id || storeDetail.district_id) &&
          storeDetail.ward_id &&
          storeDetail.address
        )
      ) {
        setAddressError("Thiếu thông tin địa chỉ cửa hàng!");
        return;
      }
      let request = {
        from_city_id: storeDetail?.city_id,
        from_city: storeDetail?.city_name,
        from_district_id: storeDetail?.district_id,
        from_district: storeDetail?.district_name,
        from_ward_id: storeDetail?.ward_id,
        to_country_id: shippingAddressDefault?.country_id,
        to_city_id: shippingAddressDefault?.city_id,
        to_city: shippingAddressDefault?.city,
        to_district_id: shippingAddressDefault?.district_id,
        to_district: shippingAddressDefault?.district,
        to_ward_id: shippingAddressDefault?.ward_id,
        from_address: storeDetail?.address,
        to_address: shippingAddressDefault?.full_address,
        price: totalAmountCustomerNeedToPay,
        quantity: 1,
        weight: SumWeight(items),
        length: 0,
        height: 0,
        width: 0,
        service_id: 0,
        service: "",
        option: "",
        insurance: 0,
        coupon: "",
        cod: 0,
      };
      setAddressError("");
      dispatch(getFeesAction(request, setInfoFees));
    } else {
      setAddressError("Thiếu thông tin địa chỉ chi tiết khách hàng!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, dispatch, items, storeDetail]);

  /**
   * Chọn yêu cầu xem hàng
   */
  useEffect(() => {
    if (orderConfig && !form.getFieldValue("requirements")) {
      if (orderConfig.for_all_order) {
        form?.setFieldsValue({
          requirements: orderConfig.order_config_action,
        });
      } else {
        form?.setFieldsValue({
          requirements: shipping_requirements?.find(
            (requirement) => requirement.value === SHIPPING_REQUIREMENT.default,
          )?.value,
        });
      }
    }
  }, [form, orderConfig, shipping_requirements]);

  return (
    <StyledComponent>
      {renderIfOrderIsEcommerce()}
      {renderIfOrderIsNotEcommerce()}
    </StyledComponent>
  );
}

export default OrderCreateShipment;
