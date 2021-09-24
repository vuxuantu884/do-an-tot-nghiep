// @ts-ignore
import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Tabs
} from "antd";
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
import ShipmentMethodDeliverPartner from "./ShipmentMethodDeliverPartner";
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
  setFee: (value: number) => void;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[];
  onPayments: (value: Array<OrderPaymentRequest>) => void;
  // fulfillments: FulFillmentResponse[];
  // isCloneOrder: boolean;
};
const {TabPane} = Tabs

const CardShipment: React.FC<CardShipmentProps> = (
  props: CardShipmentProps
) => {
  const {
    OrderDetail,
    paymentMethod,
    setHVC,
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
    payments,
  } = props;
  const dispatch = useDispatch();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  // const [deliveryServices, setDeliveryServices] =

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
    setFee(fee);
  };

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    // dispatch(DeliveryServicesGetList(setDeliveryServices));
  }, [dispatch]);


  useEffect(() => {
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
      dispatch(getFeesAction(request, setInfoFees));
    } else {
      console.log("cần thêm địa chỉ khách hàng");
    }
  }, [amount, customerInfo, dispatch, items, storeDetail]);

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
            <Col span={24}>
              <Form.Item name="dating_ship" label="Hẹn giao:">
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
            <Col span={24}>
              <Form.Item name="office_time" label="Giờ hành chính:">
                <Checkbox
                  checked={officeTime}
                  onChange={(e) => setOfficeTime(e.target.checked)}
                  style={{ marginTop: "8px" }}
                ></Checkbox>
              </Form.Item>
            </Col>
            <Col span={24}>
            <Form.Item name="requirements" label="Yêu cầu:">
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
          <Tabs defaultActiveKey="1">
            <TabPane tab="Chuyển hãng vận chuyển" key="1">
            <ShipmentMethodDeliverPartner
              amount={amount}
              changeServiceType={changeServiceType}
              // deliveryServices={deliveryServices}
              discountValue={discountValue}
              infoFees={infoFees}
              setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
              shippingFeeCustomer={shippingFeeCustomer}
              OrderDetail={OrderDetail}
              payments={payments}
            />
            </TabPane>
            <TabPane tab="Tự giao hàng" key="2">
            <ShipmentMethodSelfDelivery
              amount={amount}
              discountValue={discountValue}
              paymentMethod={paymentMethod}
              setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
              shipper={shipper}
              shippingFeeCustomer={shippingFeeCustomer}
            />
            </TabPane>
          </Tabs>
          </Row>
          
        </div>
      </Card>
    </StyledComponent>
  );
};

export default CardShipment;
