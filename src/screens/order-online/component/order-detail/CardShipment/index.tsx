// @ts-ignore
import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
} from "antd";
import IconDelivery from "assets/icon/delivery.svg";
import IconSelfDelivery from "assets/icon/self_shipping.svg";
import IconShoppingBag from "assets/icon/shopping_bag.svg";
import IconWallClock from "assets/icon/wall_clock.svg";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import {
  // DeliveryServicesGetList,
  getFeesAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderLineItemRequest,
  OrderPaymentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  // DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, {
  // useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShippingAddressDefault, SumWeight } from "utils/AppUtils";
import { PaymentMethodOption, ShipmentMethodOption } from "utils/Constants";
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
  setOfficeTime: (value: boolean) => void;
  serviceType?: string | null;
  setServiceType: (value?: string) => void;
  storeDetail?: StoreCustomResponse | null;
  amount: number;
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

const CardShipment: React.FC<CardShipmentProps> = (
  props: CardShipmentProps
) => {
  const {
    OrderDetail,
    paymentMethod,
    setPaymentMethod,
    setShipmentMethodProps,
    setHVC,
    serviceType,
    setServiceType,
    setFee,
    customerInfo,
    amount,
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

  const ShipMethodOnChange = (value: number) => {
    setServiceType(undefined);
    setShipmentMethodProps(value);
    setPaymentMethod(value);
    setShipmentMethodProps(value);
    if (paymentMethod !== PaymentMethodOption.PREPAYMENT) {
      if (value === ShipmentMethodOption.SELF_DELIVER) {
        setPaymentMethod(PaymentMethodOption.COD);
      }
    }

    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      console.log("start request fees");
      // getInfoDeliveryFees();
      setPaymentMethod(PaymentMethodOption.COD);
      //reset payment
      // onPayments([]);
    }
    if (value !== ShipmentMethodOption.DELIVER_PARTNER) {
      // onPayments([]);
    }
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );

  const changeServiceType = (
    id: number,
    code: string,
    item: any,
    fee: number
  ) => {
    console.log("changeServiceType", item);

    setHVC(id);
    setServiceType(item);
    setFee(fee);
  };

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    // dispatch(DeliveryServicesGetList(setDeliveryServices));
  }, [dispatch]);

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
      setAddressError("Thiếu thông tin địa chỉ khách hàng");
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
                onClick={() =>
                  levelOrder < 4 && ShipMethodOnChange(button.value)
                }
              >
                <img src={button.icon} alt="icon"></img>
                <span>{button.name}</span>
              </div>
            ) : (
              <div
                className={
                  shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                    ? "saleorder_shipment_button saleorder_shipment_button_border"
                    : "saleorder_shipment_button_active"
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
      <Card
        className="margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
          </div>
        }
      >
        <div className="padding-24 orders-shipment">
          <Row gutter={24}>
            <Col md={9}>
              <span className="orders-shipment__dateLabel">Hẹn giao:</span>
              <Form.Item name="dating_ship">
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  className="r-5 w-100 ip-search"
                  placeholder="Chọn ngày giao"
                  disabledDate={(current: any) =>
                    moment().add(-1, "days") >= current
                  }
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
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
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
              className="saleorder_shipment_method_btn"
              style={
                shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                  ? { border: "none" }
                  : { borderBottom: "1px solid #2A2A86" }
              }
            >
              <Space size={10}>{renderShipmentTabHeader()}</Space>
            </div>
          </Row>
          {/*--- Chuyển hãng vận chuyển ----*/}
          {shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && (
            <ShipmentMethodDeliverPartner
              amount={amount}
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
              amount={amount}
              discountValue={discountValue}
              paymentMethod={paymentMethod}
              setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
              shipper={shipper}
              shippingFeeCustomer={shippingFeeCustomer}
              totalAmountReturnProducts={totalAmountReturnProducts}
              levelOrder={levelOrder}
            />
          )}

          {/*--- Nhận tại cửa hàng ----*/}
          {shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
            <ShipmentMethodReceiveAtHome storeDetail={storeDetail} />
          )}
        </div>
      </Card>
    </StyledComponent>
  );
};

export default CardShipment;
