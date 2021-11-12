import {
  Button,
  Checkbox,
  Col,
  DatePicker, Divider,
  Form,
  FormInstance,
  Row,
  Select,
  Space,
} from "antd";
import IconDelivery from "assets/icon/delivery.svg";
import IconSelfDelivery from "assets/icon/self_shipping.svg";
import IconWallClock from "assets/icon/wall_clock.svg";
import {ShipperGetListAction} from "domain/actions/account/account.action";
import {getFeesAction} from "domain/actions/order/order.action";
import {
  actionGetOrderConfig,
  actionListConfigurationShippingServiceAndShippingFee,
} from "domain/actions/settings/order-settings.action";
import {AccountResponse} from "model/account/account.model";
import {thirdPLModel} from "model/order/shipment.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {OrderLineItemRequest} from "model/request/order.request";
import {CustomerResponse} from "model/response/customer/customer.response";
import {StoreCustomResponse} from "model/response/order/order.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import moment from "moment";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getShippingAddressDefault, SumWeight} from "utils/AppUtils";
import {ShipmentMethodOption} from "utils/Constants";
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
import ShipmentMethodReceiveAtStore from "./ShipmentMethodReceiveAtStore";
import ShipmentMethodSelfDelivery from "./ShipmentMethodSelfDelivery";
import {StyledComponent} from "./styles";

// shipment button action
type ShipmentButtonType = {
  name: string | null;
  value: number;
  icon: string | undefined;
};

type PropType = {
  shipmentMethod: number;
  orderPrice?: number;
  storeDetail: StoreCustomResponse | undefined;
  customer: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  levelOrder?: number;
  isCancelValidateDelivery: boolean;
  totalAmountCustomerNeedToPay?: number;
  form: FormInstance<any>;
  thirdPL?: thirdPLModel;
  isShowButtonCreateShipment?: boolean;
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
    levelOrder = 0,
    totalAmountCustomerNeedToPay = 0,
    form,
    isCancelValidateDelivery,
    thirdPL,
    isShowButtonCreateShipment = false,
    setThirdPL,
    onSelectShipment,
    setShippingFeeInformedToCustomer,
    handleCreateShipment,
    handleCancelCreateShipment,
  } = props;
  const dateFormat = "DD/MM/YYYY";
  const dispatch = useDispatch();
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const [addressError, setAddressError] = useState<string>("");
  const [listShippers, setListShippers] = useState<Array<AccountResponse> | null>(null);
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);
  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

  const ShipMethodOnChange = (value: number) => {
    onSelectShipment(value);
    setShippingFeeInformedToCustomer(0);
    if(value ===ShipmentMethodOption.DELIVER_PARTNER) {
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
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement
  );

  const shipmentButton: Array<ShipmentButtonType> = [
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
    // {
    //   name: "Nhận tại cửa hàng",
    //   value: 3,
    //   icon: IconShoppingBag,
    // },
    {
      name: "Giao hàng sau",
      value: 4,
      icon: IconWallClock,
    },
  ];

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
        <div style={{marginTop: 20}}>
          <Button
            type="primary"
            className="create-button-custom"
            style={{float: "right"}}
            onClick={() => {
              handleCreateShipment && handleCreateShipment();
            }}
          >
            Tạo đơn giao hàng 2
          </Button>
          <Button
            className="ant-btn-outline fixed-button cancle-button create-button-custom"
            onClick={() => {
              handleCancelCreateShipment && handleCancelCreateShipment();
            }}
            style={{float: "right"}}
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
      setAddressError("Thiếu thông tin địa chỉ chi tiết khách hàng!");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, dispatch, items, storeDetail]);

  useEffect(() => {
    dispatch(ShipperGetListAction(setListShippers));
  }, [dispatch]);

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

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
      })
    );
  }, [dispatch]);

  /**
   * orderSettings: cấu hình đơn hàng để set yêu cầu cho xem hàng
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
      <div className="padding-12 orders-shipment">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="dating_ship" label="Hẹn giao:">
              <DatePicker
                format={dateFormat}
                style={{width: "100%"}}
                className="r-5 w-100 ip-search"
                placeholder="Chọn ngày giao"
                disabledDate={(current: any) => moment().add(-1, "days") >= current}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="office_time" label="Giờ hành chính:">
              <Checkbox style={{marginTop: "8px"}}/>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="requirements" label="Yêu cầu:">
              <Select
                className="select-with-search"
                showSearch
                showArrow
                notFoundContent="Không tìm thấy kết quả"
                style={{width: "100%"}}
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
                    style={{width: "100%"}}
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
        <Divider style={{ marginTop: 6 }} />
        <Row>
          <div
            className="saleorder_shipment_method_btn 2"
            style={
              shipmentMethod === ShipmentMethodOption.DELIVER_LATER
                ? {border: "none"}
                : {borderBottom: "1px solid #2A2A86"}
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
              ? {marginTop: 15}
              : undefined
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
              setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
              isCancelValidateDelivery={isCancelValidateDelivery}
              listShippers={listShippers}
              renderButtonCreateActionHtml={renderButtonCreateActionHtml}
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
    </StyledComponent>
  );
}

export default OrderCreateShipment;
