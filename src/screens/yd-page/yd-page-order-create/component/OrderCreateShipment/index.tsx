import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormInstance,
  InputNumber,
  Row,
  Space,
  Tooltip,
} from "antd";
import IconDelivery from "assets/icon/delivery.svg";
import IconShoppingBag from "assets/icon/shopping_bag.svg";
import IconSelfDelivery from "assets/icon/self_shipping.svg";
import IconWallClock from "assets/icon/wall_clock.svg";
import { ExternalShipperGetListAction } from "domain/actions/account/account.action";
import { getFeesAction } from "domain/actions/order/order.action";
import { actionGetOrderConfig } from "domain/actions/settings/order-settings.action";
import { DeliverPartnerResponse } from "model/account/account.model";
import { thirdPLModel } from "model/order/shipment.model";
import { OrderLineItemRequest, OrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { StoreCustomResponse } from "model/response/order/order.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getShippingAddressDefault,
  getTotalAmount,
  handleCalculateShippingFeeApplyOrderSetting,
  SumWeight,
} from "utils/AppUtils";
import { PaymentMethodCode, ShipmentMethodOption } from "utils/Constants";
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
import ShipmentMethodReceiveAtStore from "./ShipmentMethodReceiveAtStore";
import ShipmentMethodSelfDelivery from "./ShipmentMethodSelfDelivery";
import { StyledComponent } from "./styles";
import { RootReducerType } from "../../../../../model/reducers/RootReducerType";
import { showSuccess } from "../../../../../utils/ToastUtils";

// shipment button action
type ShipmentButtonType = {
  name: string | null;
  value: number;
  icon: string | undefined;
};

type PropType = {
  shipmentMethod: number;
  payments: OrderPaymentRequest[];
  orderPrice?: number;
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
  shippingFeeInformedToCustomer: number | null;
  onSelectShipment: (value: number) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  handleCreateShipment?: () => void;
  handleCancelCreateShipment?: () => void;
};

/**
 * component dùng trong trang tạo đơn, chi tiết đơn hàng (đơn nháp), update đơn hàng, đổi trả đơn hàng
 *
 * isCancelValidateDelivery: ko validate khi tạo đơn nháp
 *
 * shipmentMethod: truyền giá trị mặc định
 *
 * orderPrice: giá trị đơn hàng, để tính phí ship hãng vận chuyển, khi apply cấu hình đơn hàng
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
 * handleCancelCreateShipment: xử lý khi click nút hủy trong chi tiết đơn hàng khi tạo đơn hàng chọn giao hàng sau
 */
function OrderCreateShipment(props: PropType) {
  const {
    customer,
    storeDetail,
    items,
    orderPrice,
    shipmentMethod,
    payments,
    levelOrder = 0,
    totalAmountCustomerNeedToPay = 0,
    form,
    isCancelValidateDelivery,
    thirdPL,
    isShowButtonCreateShipment = false,
    shippingServiceConfig,
    shippingFeeInformedToCustomer,
    setThirdPL,
    onSelectShipment,
    setShippingFeeInformedToCustomer,
    handleCreateShipment,
    handleCancelCreateShipment,
  } = props;
  const dateFormat = "DD/MM/YYYY";

  const transportService = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service,
  );

  const shippingAddress = useMemo(() => {
    const address = customer?.shipping_addresses?.find((item) => {
      return item.default;
    });
    if (address) {
      return address;
    } else {
      return null;
    }
  }, [customer?.shipping_addresses]);

  const dispatch = useDispatch();
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);

  const [listExternalShippers, setListExternalShippers] =
    useState<Array<DeliverPartnerResponse> | null>(null);

  const [isExistMomoPayment, setIsExistMomoPayment] = useState<boolean>(false);

  useEffect(() => {
    dispatch(ExternalShipperGetListAction(setListExternalShippers));
  }, [dispatch]);

  const ShipMethodOnChange = useCallback(
    (value: number) => {
      /** Nếu trước đó chọn PICK_AT_STORE(phí ship = 0) => thay đổi phương thức giao hàng thì apply phí ship theo cấu hình */
      if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
        handleCalculateShippingFeeApplyOrderSetting(
          shippingAddress?.city_id,
          orderPrice,
          shippingServiceConfig,
          transportService,
          form,
          setShippingFeeInformedToCustomer,
        );
      }

      onSelectShipment(value);
      // setShippingFeeInformedToCustomer(0);
      if (value === ShipmentMethodOption.PICK_AT_STORE) {
        setShippingFeeInformedToCustomer(0);
        showSuccess("Chú ý: Phí ship báo khách đã được thay đổi!");
      }
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [shipmentMethod, shippingServiceConfig],
  );

  const shipmentButton: Array<ShipmentButtonType> = [
    {
      name: "Hãng VC",
      value: ShipmentMethodOption.DELIVER_PARTNER,
      icon: IconDelivery,
    },
    {
      name: "Tự giao hàng",
      value: ShipmentMethodOption.SELF_DELIVER,
      icon: IconSelfDelivery,
    },
    {
      name: "Nhận tại CH",
      value: ShipmentMethodOption.PICK_AT_STORE,
      icon: IconShoppingBag,
    },
    {
      name: "GH sau",
      value: ShipmentMethodOption.DELIVER_LATER,
      icon: IconWallClock,
    },
  ];

  /** Nếu chọn phương thức thanh toán MOMO thì disable các hình thức vận chuyển khác
   * => Mặc định chọn Giao hàng sau
   * */
  const checkIfDisableSelectShipment = () => {
    return payments?.some((payment) => {
      return payment.payment_method_code === PaymentMethodCode.MOMO && payment.paid_amount > 0;
    });
  };

  const resetShipment = useCallback(() => {
    ShipMethodOnChange(ShipmentMethodOption.DELIVER_LATER);
    form.resetFields(["dating_ship", "office_time"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ShipMethodOnChange, form]);

  useEffect(() => {
    const momoPayment = payments?.find(
      (payment) => payment.payment_method_code === PaymentMethodCode.MOMO,
    );
    if (momoPayment && momoPayment.paid_amount > 0) {
      resetShipment();
      setIsExistMomoPayment(true);
    } else {
      setIsExistMomoPayment(false);
    }
  }, [payments, resetShipment]);
  /** ----- */

  const renderShipmentTabHeader = () => {
    return (
      <React.Fragment>
        {shipmentButton.map((button) => (
          <div key={button.value}>
            {shipmentMethod !== button.value ? (
              <div
                className="saleorder_shipment_button 2"
                key={button.value}
                style={checkIfDisableSelectShipment() ? { pointerEvents: "none" } : undefined}
                onClick={() => {
                  levelOrder < 4 && ShipMethodOnChange(button.value);
                  // if (items?.length && items?.length > 0 && button.value === 2) {
                  //   handleCalculateShippingFeeApplyOrderSetting(shippingAddress?.city_id, orderPrice, shippingServiceConfig,
                  //     undefined, form, setShippingFeeInformedToCustomer
                  //   );
                  // }
                }}
              >
                <span>{button.name}</span>
              </div>
            ) : (
              <div
                className={
                  shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                    ? "saleorder_shipment_button border"
                    : "saleorder_shipment_button active"
                }
                key={button.value}
              >
                <span>{button.name}</span>
              </div>
            )}
          </div>
        ))}
      </React.Fragment>
    );
  };

  const renderButtonCreateActionHtml = () => {
    if (isShowButtonCreateShipment) {
      return (
        <div style={{ marginTop: 20 }}>
          <Button
            type="primary"
            className="create-button-custom"
            style={{ float: "right" }}
            onClick={() => {
              handleCreateShipment && handleCreateShipment();
            }}
          >
            Tạo đơn giao hàng
          </Button>
          <Button
            className="ant-btn-outline fixed-button cancle-button create-button-custom"
            onClick={() => {
              handleCancelCreateShipment && handleCancelCreateShipment();
            }}
            style={{ float: "right" }}
          >
            Hủy
          </Button>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!storeDetail) {
      setAddressError("Thiếu thông tin địa chỉ cửa hàng!");
      return;
    }
    if (
      customer &&
      storeDetail &&
      (getShippingAddressDefault(customer)?.city_id ||
        getShippingAddressDefault(customer)?.district_id) &&
      getShippingAddressDefault(customer)?.ward_id &&
      getShippingAddressDefault(customer)?.full_address &&
      items &&
      items?.length > 0
    ) {
      let request = {
        from_city_id: storeDetail?.city_id,
        from_city: storeDetail?.city_name,
        from_district_id: storeDetail?.district_id,
        from_district: storeDetail?.district_name,
        from_ward_id: storeDetail?.ward_id,
        to_country_id: getShippingAddressDefault(customer)?.country_id,
        to_city_id: getShippingAddressDefault(customer)?.city_id,
        to_city: getShippingAddressDefault(customer)?.city,
        to_district_id: getShippingAddressDefault(customer)?.district_id,
        to_district: getShippingAddressDefault(customer)?.district,
        to_ward_id: getShippingAddressDefault(customer)?.ward_id,
        from_address: storeDetail?.address,
        to_address: getShippingAddressDefault(customer)?.full_address,
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
        product_value: getTotalAmount(items),
      };
      setAddressError("");
      dispatch(getFeesAction(request, setInfoFees));
    } else {
      setAddressError("Thiếu thông tin địa chỉ chi tiết khách hàng!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, dispatch, items, storeDetail]);

  useEffect(() => {
    // dispatch(DeliveryServicesGetList(setDeliveryServices));
  }, [dispatch]);

  /**
   * Chọn yêu cầu xem hàng
   */
  useEffect(() => {
    if (orderConfig) {
      if (orderConfig.for_all_order) {
        form?.setFieldsValue({
          requirements: orderConfig.order_config_action,
        });
      }
    }
  }, [form, orderConfig]);

  /**
   * orderSettings: cấu hình đơn hàng để set yêu cầu cho xem hàng
   */
  useEffect(() => {
    dispatch(
      actionGetOrderConfig((response) => {
        setOrderConfig(response);
      }),
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      {!isExistMomoPayment && (
        <div className="padding-12 orders-shipment">
          <span className="saleorder_shipment_method-heading">THÔNG TIN VẬN CHUYỂN</span>
          <Row gutter={24} style={{ padding: "6px 0" }}>
            <Col span={11} style={{ padding: "0 5px 0 10px" }}>
              <Form.Item name="dating_ship">
                <DatePicker
                  format={dateFormat}
                  style={{ width: "100%" }}
                  className="r-5 w-100 ip-search"
                  placeholder="Ngày hẹn giao"
                  getPopupContainer={(trigger: any) => trigger.parentElement}
                  disabledDate={(current: any) => moment().add(-1, "days") >= current}
                />
              </Form.Item>
            </Col>

            <Col span={11} style={{ padding: "0 10px 0 5px" }}>
              <Form.Item>
                <InputNumber
                  style={{ textAlign: "left", width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  placeholder="Phí ship báo khách"
                  min={0}
                  max={999999999}
                  onChange={(value) => {
                    if (value) {
                      setShippingFeeInformedToCustomer(Number(value));
                    } else {
                      setShippingFeeInformedToCustomer(0);
                    }
                  }}
                  value={shippingFeeInformedToCustomer || ""}
                />
              </Form.Item>
            </Col>

            <Col span={2} style={{ padding: 0 }}>
              <Form.Item name="office_time" valuePropName="checked">
                <Tooltip placement="topRight" title="Giờ hành chính">
                  <Checkbox style={{ marginTop: "8px" }} />
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <div
              className="saleorder_shipment_method_btn 2"
              style={
                shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                  ? { border: "none" }
                  : { borderBottom: "1px solid #E5E5E5" }
              }
            >
              <Space size={10} align="start">
                {renderShipmentTabHeader()}
              </Space>
            </div>
          </Row>
          <div
            className="saleorder_shipment_method_content"
            style={
              shipmentMethod !== ShipmentMethodOption.DELIVER_LATER ? { marginTop: 10 } : undefined
            }
          >
            {/*--- Chuyển hãng vận chuyển ----*/}
            {shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && (
              <ShipmentMethodDeliverPartner
                totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                thirdPL={thirdPL}
                setThirdPL={setThirdPL}
                shippingServiceConfig={shippingServiceConfig}
                setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                infoFees={infoFees}
                addressError={addressError}
                levelOrder={levelOrder}
                orderPrice={orderPrice}
                customer={customer}
                form={form}
                renderButtonCreateActionHtml={renderButtonCreateActionHtml}
              />
            )}
            {/*--- Tự vận chuyển ----*/}
            {shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
              <ShipmentMethodSelfDelivery
                totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                levelOrder={levelOrder}
                isCancelValidateDelivery={isCancelValidateDelivery}
                storeId={storeDetail?.id}
                renderButtonCreateActionHtml={renderButtonCreateActionHtml}
                thirdPL={thirdPL}
                setThirdPL={setThirdPL}
                listExternalShippers={listExternalShippers}
                form={form}
              />
            )}

            {/*--- Nhận tại cửa hàng ----*/}
            {shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
              <ShipmentMethodReceiveAtStore
                storeDetail={storeDetail}
                isCancelValidateDelivery={isCancelValidateDelivery}
                renderButtonCreateActionHtml={renderButtonCreateActionHtml}
              />
            )}
          </div>
        </div>
      )}
    </StyledComponent>
  );
}

export default OrderCreateShipment;
