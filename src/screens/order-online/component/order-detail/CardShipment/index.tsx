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
import { ShipperGetListAction } from "domain/actions/account/account.action";
import { getFeesAction } from "domain/actions/order/order.action";
import {
  actionGetOrderConfig,
  actionListConfigurationShippingServiceAndShippingFee,
} from "domain/actions/settings/order-settings.action";
import { AccountResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderLineItemRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { StoreCustomResponse } from "model/response/order/order.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShippingAddressDefault, SumWeight } from "utils/AppUtils";
import { ShipmentMethodOption } from "utils/Constants";
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
import ShipmentMethodReceiveAtHome from "./ShipmentMethodReceiveAtHome";
import ShipmentMethodSelfDelivery from "./ShipmentMethodSelfDelivery";
import { StyledComponent } from "./styles";

type CardShipmentProps = {
  shipmentMethod: number;
  orderPrice?: number;
  storeDetail: StoreCustomResponse | undefined;
  customer: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  levelOrder?: number;
  updateOrder?: boolean;
  isCancelValidateDelivery: boolean;
  totalAmountCustomerNeedToPay?: number;
  serviceType3PL: string | undefined;
  form: FormInstance<any>;
  setServiceType3PL: (value: string | undefined) => void;
  setShipmentMethod: (value: number) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  setHVC: (value: number) => void;
};

/**
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
 * serviceType3PL: loại dịch vụ hãng vận chuyển
 *
 * setServiceType3PL: xử lý khi chọn loại dịch vụ hãng vận chuyển
 *
 * setShipmentMethod: xử lý khi chọn loại shipment
 *
 * setShippingFeeInformedToCustomer: xử lý khi điền phí ship báo khách
 *
 * setHVC: xử lý khi chọn hãng vận chuyển
 *
 * form
 *
 * customer: thông tin khách hàng - tính phí ship
 *
 * storeDetail: thông tin cửa hàng - tính phí ship
 */
const CardShipment: React.FC<CardShipmentProps> = (props: CardShipmentProps) => {
  const {
    customer,
    storeDetail,
    items,
    orderPrice,
    shipmentMethod,
    levelOrder = 0,
    updateOrder,
    totalAmountCustomerNeedToPay = 0,
    serviceType3PL,
    form,
    isCancelValidateDelivery,
    setHVC,
    setShipmentMethod,
    setShippingFeeInformedToCustomer,
    setServiceType3PL,
  } = props;
  console.log("orderPrice", orderPrice);
  const dispatch = useDispatch();
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");
  const [listShippers, setListShippers] = useState<Array<AccountResponse> | null>(null);
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);
  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

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
    setServiceType3PL(code);
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

  useEffect(() => {
    dispatch(ShipperGetListAction(setListShippers));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
      })
    );
  }, [dispatch]);

  /**
   * orderSettings
   */
  useEffect(() => {
    dispatch(
      actionGetOrderConfig((response) => {
        setOrderConfig(response);
      })
    );
  }, [dispatch]);

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
                serviceType3PL={serviceType3PL}
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
                isCancelValidateDelivery={isCancelValidateDelivery}
                listShippers={listShippers}
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
