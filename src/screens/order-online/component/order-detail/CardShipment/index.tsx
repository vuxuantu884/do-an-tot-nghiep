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
  DeliveryServicesGetList,
  InfoGHNAction,
  InfoGHTKAction,
  InfoVTPAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  GHNFeeRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  ShippingGHTKRequest,
  VTPFeeRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  DeliveryServiceResponse,
  FulFillmentResponse,
  GHNFeeResponse,
  OrderResponse,
  ShippingGHTKResponse,
  StoreCustomResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, {
  useCallback,
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
  setServiceType: (value: string) => void;
  storeDetail?: StoreCustomResponse | null;
  amount: number;
  paymentMethod: number;
  shippingFeeCustomer: number | null;
  shippingFeeCustomerHVC: number | null;
  customerInfo: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  discountValue: number | null;
  officeTime: boolean | undefined;
  setFeeGhtk: (value: number) => void;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[];
  onPayments: (value: Array<OrderPaymentRequest>) => void;
  fulfillments: FulFillmentResponse[];
  isCloneOrder: boolean;
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
    setServiceType,
    setFeeGhtk,
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
    onPayments,
    fulfillments,
    isCloneOrder,
  } = props;
  console.log("props", props);
  const dispatch = useDispatch();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [infoGHTK, setInfoGHTK] = useState<Array<ShippingGHTKResponse>>([]);
  const [infoGHN, setInfoGHN] = useState<GHNFeeResponse | null>(null);
  const [infoVTP, setInfoVTP] = useState<Array<VTPFeeResponse>>([]);
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse> | null>(null);
  const ShipMethodOnChange = (value: number) => {
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
      getInfoDeliveryGHTK();
      getInfoDeliveryGHN();
      getInfoDeliveryVTP();
      setPaymentMethod(PaymentMethodOption.COD);
      //reset payment
      onPayments([]);
    }
    if (value !== ShipmentMethodOption.DELIVER_PARTNER) {
      onPayments([]);
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
    setHVC(id);
    setServiceType(item);
    setFeeGhtk(fee);
  };

  const getInfoDeliveryGHTK = useCallback(() => {
    console.log("getInfoDeliveryGHTK");

    let request: ShippingGHTKRequest = {
      pick_address: storeDetail?.address,
      pick_province: storeDetail?.city_name,
      pick_district: storeDetail?.district_name,
      province: getShippingAddressDefault(customerInfo)?.city,
      district: getShippingAddressDefault(customerInfo)?.district,
      address: getShippingAddressDefault(customerInfo)?.full_address,
      weight: SumWeight(items),
      value: amount,
      transport: "",
    };
    console.log("request", request);
    if (
      request.pick_address &&
      request.pick_district &&
      request.pick_province &&
      request.address &&
      request.province &&
      request.weight &&
      request.district
    ) {
      dispatch(InfoGHTKAction(request, setInfoGHTK));
    } else {
      console.log(
        request.pick_address,
        request.pick_district,
        request.pick_province,
        request.address,
        request.province,
        request.weight,
        request.district
      );
    }
  }, [dispatch, amount, customerInfo, items, storeDetail]);

  const getInfoDeliveryGHN = useCallback(() => {
    console.log("getInfoDeliveryGHN");
    let request: GHNFeeRequest = {
      created_by: null,
      created_name: null,
      updated_by: null,
      updated_name: null,
      request_id: null,
      operator_kc_id: null,

      sender_country_id: storeDetail?.country_id,
      sender_city_id: storeDetail?.city_id,
      sender_district_id: storeDetail?.district_id,
      sender_ward_id: storeDetail?.ward_id,

      receive_country_id: getShippingAddressDefault(customerInfo)?.country_id,
      receive_city_id: getShippingAddressDefault(customerInfo)?.city_id,
      receive_district_id: getShippingAddressDefault(customerInfo)?.district_id,
      receive_ward_id: getShippingAddressDefault(customerInfo)?.ward_id,

      sender_address: storeDetail?.address || storeDetail?.full_address,
      receive_address: getShippingAddressDefault(customerInfo)?.full_address,

      price: 0,
      quantity: 0,
      weight: SumWeight(items),
      length: 0,
      height: 0,
      width: 0,
      ghn_service_id: 1,
      coupon: null,
      cod: amount,
    };

    if (
      request.sender_country_id &&
      request.sender_city_id &&
      request.sender_district_id &&
      request.sender_ward_id &&
      request.receive_country_id &&
      request.receive_city_id &&
      request.receive_district_id &&
      request.receive_ward_id &&
      request.sender_address &&
      request.receive_address
    ) {
      dispatch(InfoGHNAction(request, setInfoGHN));
    } else {
      console.log(
        request.sender_country_id,
        request.sender_city_id,
        request.sender_district_id,
        request.sender_ward_id,

        request.receive_country_id,
        request.receive_city_id,
        request.receive_district_id,
        request.receive_ward_id,

        request.sender_address,
        request.receive_address,
        request.ghn_service_id
      );
    }
  }, [dispatch, amount, customerInfo, items, storeDetail]);

  const getInfoDeliveryVTP = useCallback(() => {
    console.log("getInfoDeliveryVTP");
    let request: VTPFeeRequest = {
      created_by: null,
      created_name: null,
      updated_by: null,
      updated_name: null,
      request_id: null,
      operator_kc_id: null,

      sender_country_id: storeDetail?.country_id,
      sender_city_id: storeDetail?.city_id,
      sender_district_id: storeDetail?.district_id,
      sender_ward_id: storeDetail?.ward_id,

      receive_country_id: getShippingAddressDefault(customerInfo)?.country_id,
      receive_city_id: getShippingAddressDefault(customerInfo)?.city_id,
      receive_district_id: getShippingAddressDefault(customerInfo)?.district_id,
      receive_ward_id: getShippingAddressDefault(customerInfo)?.ward_id,

      sender_address: storeDetail?.address || storeDetail?.full_address,
      receive_address: getShippingAddressDefault(customerInfo)?.full_address,

      price: 0,
      quantity: 0,
      weight: SumWeight(items),
      length: 10,
      height: 10,
      width: 10,
      ghn_service_id: 1,
      coupon: null,
      cod: amount,
    };
    console.log("customerInfo", customerInfo);
    console.log("request", request);

    if (
      request.sender_country_id &&
      request.sender_city_id &&
      request.sender_district_id &&
      request.sender_ward_id &&
      request.receive_country_id &&
      request.receive_city_id &&
      request.receive_district_id &&
      request.receive_ward_id &&
      request.sender_address &&
      request.receive_address
    ) {
      dispatch(InfoVTPAction(request, setInfoVTP));
    } else {
      console.log(
        request.sender_country_id,
        request.sender_city_id,
        request.sender_district_id,
        request.sender_ward_id,

        request.receive_country_id,
        request.receive_city_id,
        request.receive_district_id,
        request.receive_ward_id,

        request.sender_address,
        request.receive_address
      );
    }
  }, [dispatch, amount, customerInfo, items, storeDetail]);

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(DeliveryServicesGetList(setDeliveryServices));
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
    console.log("storeDetail", storeDetail);
    if (isCloneOrder) {
      getInfoDeliveryGHTK();
      getInfoDeliveryGHN();
      getInfoDeliveryVTP();
    }
  }, [
    getInfoDeliveryGHN,
    getInfoDeliveryGHTK,
    getInfoDeliveryVTP,
    isCloneOrder,
    storeDetail,
  ]);

  const renderShipmentTabHeader = () => {
    return (
      <React.Fragment>
        {shipmentButton.map((button) => (
          <div key={button.value}>
            {shipmentMethod !== button.value ? (
              <div
                className="saleorder_shipment_button"
                key={button.value}
                onClick={() => ShipMethodOnChange(button.value)}
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
              changeServiceType={changeServiceType}
              deliveryServices={deliveryServices}
              discountValue={discountValue}
              infoGHN={infoGHN}
              infoGHTK={infoGHTK}
              infoVTP={infoVTP}
              setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
              shippingFeeCustomer={shippingFeeCustomer}
              OrderDetail={OrderDetail}
              payments={payments}
              fulfillments={fulfillments}
              isCloneOrder={isCloneOrder}
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
