// @ts-ignore
import { Card, Checkbox, Col, DatePicker, Form, Row, Select, Space } from "antd";
import IconDelivery from "assets/icon/delivery.svg";
import IconSelfDelivery from "assets/icon/self_shipping.svg";
import IconShoppingBag from "assets/icon/shopping_bag.svg";
import IconWallClock from "assets/icon/wall_clock.svg";
import { OrderCreateContext } from "contexts/order-online/order-create-context";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import {
  // DeliveryServicesGetList,
  getFeesAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderLineItemRequest, OrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  // DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, {
  useContext,
  // useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShippingAddressDefault, SumWeight } from "utils/AppUtils";
import { ShipmentMethodOption } from "utils/Constants";
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
import ShipmentMethodReceiveAtHome from "./ShipmentMethodReceiveAtHome";
import ShipmentMethodSelfDelivery from "./ShipmentMethodSelfDelivery";
import { StyledComponent } from "./styles";

type CardShipmentProps = {
  shipmentMethod: number;
  setShipmentMethodProps: (value: number) => void;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  setShippingFeeInformedCustomerHVC: (value: number | null) => void;
  setPaymentMethod: (value: number) => void;
  setHVC: (value: number) => void;
  setHvcName?: (value: string) => void;
  setHvcCode?: (value: string) => void;
  setOfficeTime: (value: boolean) => void;
  serviceType?: string | null;
  setServiceType: (value?: string) => void;
  setServiceName: (value: string) => void;
  storeDetail?: StoreCustomResponse | null;
  amount: number;
  totalPaid?: number;
  paymentMethod: number;
  shippingFeeCustomer: number | null;
  shippingFeeCustomerHVC: number | null;
  customerInfo: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  discountValue: number | null;
  officeTime: boolean | undefined;
  setFee: (value: number) => void;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[];
  onPayments: (value: Array<OrderPaymentRequest>) => void;
  fulfillments: FulFillmentResponse[];
  isCloneOrder: boolean;
  levelOrder?: number;
  updateOrder?: boolean;
  totalAmountReturnProducts?: number;
};

const CardShipment: React.FC<CardShipmentProps> = (props: CardShipmentProps) => {
  const {
    OrderDetail,
    setShipmentMethodProps,
    setHVC,
    setHvcName,
    setHvcCode,
    serviceType,
    setServiceType,
    setServiceName,
    setFee,
    customerInfo,
    amount,
    totalPaid,
    storeDetail,
    items,
    setShippingFeeInformedCustomer,
    discountValue,
    shippingFeeCustomer,
    officeTime,
    setOfficeTime,
    shipmentMethod,
    payments,
    // onPayments,
    fulfillments,
    isCloneOrder,
    levelOrder = 0,
    totalAmountReturnProducts,
  } = props;
  const dispatch = useDispatch();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");

  // data context
  const createOrderContext = useContext(OrderCreateContext);

  const orderConfig = createOrderContext?.orderConfig;
  const form = createOrderContext?.form;

  const ShipMethodOnChange = (value: number) => {
    setServiceType(undefined);
    setShipmentMethodProps(value);
    if (levelOrder < 3) {
      // setPaymentMethod(value);
    }
    setShipmentMethodProps(value);
    // if (paymentMethod !== PaymentMethodOption.PREPAYMENT) {
    //   if (value === ShipmentMethodOption.SELF_DELIVER) {
    //     // setPaymentMethod(PaymentMethodOption.COD);
    //   }
    // }

    // if (value === ShipmentMethodOption.DELIVER_PARTNER) {
    //   console.log("start request fees");
    //   // getInfoDeliveryFees();
    //   // setPaymentMethod(PaymentMethodOption.COD);
    //   //reset payment
    //   // onPayments([]);
    // }
    // if (value !== ShipmentMethodOption.DELIVER_PARTNER) {
    //   // onPayments([]);
    // }
    if (value === ShipmentMethodOption.DELIVER_LATER || value === ShipmentMethodOption.PICK_AT_STORE) {
      setShippingFeeInformedCustomer(0)
    }
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement
  );

  const changeServiceType = (
    id: number,
    code: string,
    item: any,
    fee: number,
    name: string,
    serviceName: string
  ) => {
    console.log("changeServiceType", item);

    setHVC(id);
    setServiceType(item);
    setFee(fee);
    setHvcName && setHvcName(name);
    setHvcCode && setHvcCode(code);
    setServiceName(serviceName)
  };

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    // dispatch(DeliveryServicesGetList(setDeliveryServices));
  }, [dispatch]);

  useEffect(() => {
    if (orderConfig) {
      if (orderConfig.for_all_order) {
        form?.setFieldsValue({
          requirements: orderConfig.order_config_action,
        });
        // form?.resetFields();
      }
    }
  }, [form, orderConfig]);

  // shipment button action
  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: string | undefined;
  }

  const shipmentButton: Array<ShipmentButtonModel> = [
    {
      name: "Chuyển hãng vận chuyển",
      value: 1,
      icon: IconDelivery,
    },
    {
      name: "Tự giao hàng",
      value: 2,
      icon: IconSelfDelivery,
    },
    {
      name: "Nhận tại cửa hàng",
      value: 3,
      icon: IconShoppingBag,
    },
    {
      name: "Giao hàng sau",
      value: 4,
      icon: IconWallClock,
    },
  ];

  useEffect(() => {
    if (!storeDetail) {
      setAddressError("Thiếu thông tin địa chỉ cửa hàng");
    }
    if (
      customerInfo &&
      storeDetail &&
      (getShippingAddressDefault(customerInfo)?.city_id ||
        getShippingAddressDefault(customerInfo)?.district_id) &&
      getShippingAddressDefault(customerInfo)?.ward_id &&
      getShippingAddressDefault(customerInfo)?.full_address
    ) {
      let request = {
        from_city_id: storeDetail?.city_id,
        from_city: storeDetail?.city_name,
        from_district_id: storeDetail?.district_id,
        from_district: storeDetail?.district_name,
        from_ward_id: storeDetail?.ward_id,
        to_country_id: getShippingAddressDefault(customerInfo)?.country_id,
        to_city_id: getShippingAddressDefault(customerInfo)?.city_id,
        to_city: getShippingAddressDefault(customerInfo)?.city,
        to_district_id: getShippingAddressDefault(customerInfo)?.district_id,
        to_district: getShippingAddressDefault(customerInfo)?.district,
        to_ward_id: getShippingAddressDefault(customerInfo)?.ward_id,
        from_address: storeDetail?.address,
        to_address: getShippingAddressDefault(customerInfo)?.full_address,
        price: amount,
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
      console.log("request", request);
      setAddressError("");
      dispatch(getFeesAction(request, setInfoFees));
    } else {
      setAddressError("Thiếu thông tin địa chỉ chi tiết khách hàng");
    }
  }, [amount, customerInfo, dispatch, items, storeDetail]);

  const renderShipmentTabHeader = () => {
    return (
      <React.Fragment>
        {shipmentButton.map((button) => (
          <div key={button.value}>
            {shipmentMethod !== button.value ? (
              <div
                className="saleorder_shipment_button 2"
                key={button.value}
                onClick={() => levelOrder < 4 && ShipMethodOnChange(button.value)}
              >
                <img src={button.icon} alt="icon"></img>
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
                <img src={button.icon} alt="icon"></img>
                <span>{button.name}</span>
              </div>
            )}
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <StyledComponent>
      <Card title="ĐÓNG GÓI VÀ GIAO HÀNG">
        <div className="orders-shipment">
          <Row gutter={24}>
            <Col md={9}>
              <span className="orders-shipment__dateLabel">Hẹn giao:</span>
              <Form.Item name="dating_ship">
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  className="r-5 w-100 ip-search"
                  placeholder="Chọn ngày giao"
                  disabledDate={(current: any) => moment().add(-1, "days") >= current}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item name="office_time">
                <Checkbox
                  checked={officeTime}
                  onChange={(e) => setOfficeTime(e.target.checked)}
                  style={{ marginTop: "8px" }}
                >
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
                  disabled={orderConfig?.for_all_order}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {shipping_requirements?.map((item, index) => (
                    <Select.Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item.value}
                    >
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
          <div
            className="saleorder_shipment_method_content"
            style={
              shipmentMethod !== ShipmentMethodOption.DELIVER_LATER
                ? { marginTop: 15 }
                : undefined
            }
          >
            {/*--- Chuyển hãng vận chuyển ----*/}
            {shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && (
              <ShipmentMethodDeliverPartner
                amount={amount}
                totalPaid={totalPaid}
                serviceType={serviceType}
                changeServiceType={changeServiceType}
                // deliveryServices={deliveryServices}
                discountValue={discountValue}
                infoFees={infoFees}
                setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
                shippingFeeCustomer={shippingFeeCustomer}
                OrderDetail={OrderDetail}
                payments={payments}
                fulfillments={fulfillments}
                isCloneOrder={isCloneOrder}
                addressError={addressError}
                levelOrder={levelOrder}
                totalAmountReturnProducts={totalAmountReturnProducts}
              />
            )}

            {shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
              <ShipmentMethodSelfDelivery
                setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
                shippingFeeCustomer={shippingFeeCustomer}
                amount={amount}
                totalPaid={totalPaid}
                discountValue={discountValue}
                shipper={shipper}
                levelOrder={levelOrder}
                totalAmountReturnProducts={totalAmountReturnProducts}
              />
            )}

            {/*--- Nhận tại cửa hàng ----*/}
            {shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
              <ShipmentMethodReceiveAtHome storeDetail={storeDetail} />
            )}
          </div>
        </div>
      </Card>
    </StyledComponent>
  );
};

export default CardShipment;
