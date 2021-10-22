// @ts-ignore
import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Row,
  Select,
  Space,
} from "antd";
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
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
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
  orderPrice: number;
  storeDetail?: StoreCustomResponse | null;
  customer: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  levelOrder?: number;
  updateOrder?: boolean;
  totalAmountCustomerNeedToPay?: number;
  serviceType?: string | null;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  setShipmentMethod: (value: number) => void;
  setShippingFeeInformedToCustomer: (value: number | null) => void;
  setHVC: (value: number) => void;
  form: FormInstance<any>;
  orderConfig: OrderConfigResponseModel;
};

const CardShipment: React.FC<CardShipmentProps> = (props: CardShipmentProps) => {
  const {
    setHVC,
    setShipmentMethod,
    setShippingFeeInformedToCustomer,
    customer,
    storeDetail,
    items,
    orderPrice,
    shipmentMethod,
    levelOrder = 0,
    updateOrder,
    totalAmountCustomerNeedToPay = 0,
    serviceType,
    shippingServiceConfig,
    form,
    orderConfig,
  } = props;
  const dispatch = useDispatch();
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");

  const ShipMethodOnChange = (value: number) => {
    setShipmentMethod(value);
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement
  );

  const changeServiceType = (
    id: number,
    code: string,
    item: any,
    fee: number,
    name: string
  ) => {
    console.log("changeServiceType", item);

    setHVC(id);
  };

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
      customer &&
      storeDetail &&
      (getShippingAddressDefault(customer)?.city_id ||
        getShippingAddressDefault(customer)?.district_id) &&
      getShippingAddressDefault(customer)?.ward_id &&
      getShippingAddressDefault(customer)?.full_address
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
      };
      console.log("request", request);
      setAddressError("");
      dispatch(getFeesAction(request, setInfoFees));
    } else {
      setAddressError("Thiếu thông tin địa chỉ khách hàng 1");
    }
  }, [customer, dispatch, items, storeDetail, totalAmountCustomerNeedToPay]);

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
                <Checkbox style={{ marginTop: "8px" }}>Giờ hành chính</Checkbox>
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
                totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                serviceType={serviceType}
                shippingServiceConfig={shippingServiceConfig}
                changeServiceType={changeServiceType}
                setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                infoFees={infoFees}
                addressError={addressError}
                levelOrder={levelOrder}
                orderPrice={orderPrice}
                customer={customer}
                form={form}
              />
            )}

            {shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
              <ShipmentMethodSelfDelivery
                totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                levelOrder={levelOrder}
                setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                isCancelValidate={isCancelValidate}
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
