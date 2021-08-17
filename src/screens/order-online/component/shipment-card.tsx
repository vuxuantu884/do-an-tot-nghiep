// @ts-ignore
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Form,
  Select,
  DatePicker,
  Checkbox, Divider
} from "antd";
import moment from "moment";
import storeBluecon from "assets/img/storeBlue.svg";
import deliveryIcon from "assets/icon/delivery.svg";
import selfdeliver from "assets/icon/self_shipping.svg";
import shoppingBag from "assets/icon/shopping_bag.svg";
import wallClock from "assets/icon/wall_clock.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useDispatch, useSelector } from "react-redux";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { AccountResponse } from "model/account/account.model";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import CustomSelect from "component/custom/select.custom";
import NumberInput from "component/custom/number-input.custom";
import {
  formatCurrency,
  getShipingAddresDefault,
  replaceFormatString,
  SumWeight,
} from "utils/AppUtils";
import {
  PaymentMethodOption,
  ShipmentMethodOption,
  TRANSPORTS,
} from "utils/Constants";
import {
  OrderLineItemRequest,
  ShippingGHTKRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  DeliveryServicesGetList,
  InfoGHTKAction,
} from "domain/actions/order/order.action";
import {
  DeliveryServiceResponse,
  ShippingGHTKResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
type ShipmentCardProps = {
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
  cusomerInfo: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
  discountValue: number | null;
  officeTime: boolean | undefined;
  setFeeGhtk: (value: number) => void;
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [infoGHTK, setInfoGHTK] = useState<Array<ShippingGHTKResponse>>([]);
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse> | null>(null);
  const [shipmentMethodState, setshipmentMethod] = useState<number>(4);
  const ShipMethodOnChange = (value: number) => {
    setshipmentMethod(value);
    props.setShipmentMethodProps(value);
    if (props.paymentMethod !== PaymentMethodOption.PREPAYMENT) {
      if (value === ShipmentMethodOption.SELFDELIVER) {
        props.setPaymentMethod(PaymentMethodOption.COD);
      }
    }

    if (value === ShipmentMethodOption.DELIVERPARNER) {
      getInfoDeliveryGHTK(TRANSPORTS.ROAD);
      getInfoDeliveryGHTK(TRANSPORTS.FLY);
      props.setPaymentMethod(PaymentMethodOption.COD);
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
    props.setHVC(id);
    props.setServiceType(item);
    props.setFeeGhtk(fee);
  };

  const getInfoDeliveryGHTK = useCallback(
    (type: string) => {
      let request: ShippingGHTKRequest = {
        pick_address: props.storeDetail?.address,
        pick_province: props.storeDetail?.city_name,
        pick_district: props.storeDetail?.district_name,
        province: getShipingAddresDefault(props.cusomerInfo)?.city,
        district: getShipingAddresDefault(props.cusomerInfo)?.district,
        address: getShipingAddresDefault(props.cusomerInfo)?.full_address,
        weight: SumWeight(props.items),
        value: props.amount,
        transport: "",
      };

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
      }
    },
    [dispatch, props.amount, props.cusomerInfo, props.items, props.storeDetail]
  );

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
      icon: deliveryIcon,
    },
    {
      name: "Tự giao hàng",
      value: 2,
      icon: selfdeliver,
    },
    {
      name: "Nhận tại cửa hàng",
      value: 3,
      icon: shoppingBag,
    },
    {
      name: "Giao hàng sau",
      value: 4,
      icon: wallClock,
    },
  ];

  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
        </div>
      }
    >
      <div className="padding-24 orders-shipment">
        <Row gutter={24} style={{ justifyContent: "space-between" }}>
          <Col md={9}>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
                marginRight: "10px",
              }}
            >
              Hẹn giao:
            </span>
            <Form.Item name="dating_ship">
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                className="r-5 w-100 ip-search"
                placeholder="Chọn ngày giao"
                disabledDate={(current: any) => moment().add(-1, 'days')  >= current
                }
              />
            </Form.Item>
          </Col>

          <Col md={6}>
            <Form.Item name="office_time">
              <Checkbox
                checked={props.officeTime}
                onChange={(e) => props.setOfficeTime(e.target.checked)}
                style={{ marginTop: "8px" }}
              >
                Giờ hành chính
              </Checkbox>
            </Form.Item>
          </Col>
          <Col md={9}>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
                marginRight: "10px",
              }}
            >
              Yêu cầu:
            </span>
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
              props.shipmentMethod === ShipmentMethodOption.DELIVERLATER
                ? { border: "none" }
                : { borderBottom: "1px solid #2A2A86" }
            }
          >
            <Space size={10}>
              {shipmentButton.map((button) => (
                <div key={button.value}>
                  {props.shipmentMethod !== button.value ? (
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
                        props.shipmentMethod ===
                        ShipmentMethodOption.DELIVERLATER
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
            </Space>
          </div>
        </Row>
        {/*--- Chuyển hãng vận chuyển ----*/}
        {shipmentMethodState === ShipmentMethodOption.DELIVERPARNER && (
          <>
            <Row gutter={20}>
              <Col md={12}>
                <Form.Item label="Tiền thu hộ:">
                  <NumberInput
                    format={(a: string) => formatCurrency(a)}
                    replace={(a: string) => replaceFormatString(a)}
                    placeholder="0"
                    value={
                      props.amount +
                      (props.shippingFeeCustomer
                        ? props.shippingFeeCustomer
                        : 0) -
                      (props.discountValue ? props.discountValue : 0)
                    }
                    style={{
                      textAlign: "right",
                      width: "100%",
                      color: "#222222",
                    }}
                    maxLength={999999999999}
                    minLength={0}
                  />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item
                  label="Phí ship báo khách"
                  name="shipping_fee_informed_to_customer"
                >
                  <NumberInput
                    format={(a: string) => formatCurrency(a)}
                    replace={(a: string) => replaceFormatString(a)}
                    placeholder="0"
                    style={{
                      textAlign: "right",
                      width: "100%",
                      color: "#222222",
                    }}
                    maxLength={15}
                    minLength={0}
                    onChange={props.setShippingFeeInformedCustomer}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="ant-table ant-table-bordered custom-table">
              <div className="ant-table-container">
                <div className="ant-table-content">
                  <table
                    className="table-bordered"
                    style={{ width: "100%", tableLayout: "auto" }}
                  >
                    <thead className="ant-table-thead">
                      <tr>
                        <th className="ant-table-cell">Hãng vận chuyển</th>
                        <th className="ant-table-cell">Dịch vụ chuyển phát</th>
                        <th
                          className="ant-table-cell"
                          style={{ textAlign: "right" }}
                        >
                          Cước phí
                        </th>
                      </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                      {deliveryServices &&
                        deliveryServices.map((single, index) => {
                          return (
                            <React.Fragment key={index}>
                              <tr>
                                <td>
                                  <img
                                    src={single.logo ? single.logo : ""}
                                    alt=""
                                    style={{ width: "184px", height: "41px" }}
                                  />
                                </td>
                                <td style={{ padding: 0 }}>
                                  {single.code === "ghtk" ? (
                                    <div>
                                      <label
                                        className="radio-container"
                                      >
                                        <input
                                          type="radio"
                                          name="tt"
                                          className="radio-delivery"
                                          value="standard"
                                          onChange={(e) =>
                                            changeServiceType(
                                              single.id,
                                              single.code,
                                              "standard",
                                              infoGHTK.length > 1
                                              ? infoGHTK[0].fee
                                              : 0
                                            )
                                          }
                                        />
                                        <span className="checkmark">
                                        </span>
                                        Đường bộ
                                      </label>
                                      <Divider style={{margin: "8px 0"}}/>
                                      <label
                                        className="radio-container"
                                      >
                                        <input
                                          type="radio"
                                          name="tt"
                                          className="radio-delivery"
                                          value="express"
                                          onChange={(e) =>
                                            changeServiceType(
                                              single.id,
                                              single.code,
                                              "express",
                                              infoGHTK.length > 1
                                                ? infoGHTK[1].fee
                                                : 0
                                            )
                                          }
                                        />
                                        <span className="checkmark"></span>
                                        Đường bay
                                      </label>
                                    </div>
                                  ) : (
                                    <label className="radio-container">
                                      <input
                                        type="radio"
                                        name="tt"
                                        className="radio-delivery"
                                        value={`${single.code}_standard`}
                                        onChange={(e) =>
                                          changeServiceType(
                                            single.id,
                                            single.code,
                                            "standard",
                                            20000
                                          )
                                        }
                                      />
                                      <span className="checkmark"></span>
                                      Chuyển phát nhanh PDE
                                    </label>
                                  )}
                                </td>
                                <td style={{ padding: 0, textAlign: "right" }}>
                                  {single.code === "ghtk" ? (
                                    <div>
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        {infoGHTK && infoGHTK.length > 0
                                          ? formatCurrency(infoGHTK[0].fee)
                                          : 0}
                                      </div>
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        {infoGHTK && infoGHTK.length > 1
                                          ? formatCurrency(infoGHTK[1].fee)
                                          : 0}
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      style={{ padding: "8px 16px" }}
                                      className="custom-table__has-border-bottom custom-table__has-select-radio"
                                    >
                                      100.000
                                    </div>
                                  )}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {shipmentMethodState === ShipmentMethodOption.SELFDELIVER && (
          <Row gutter={20}>
            <Col md={12}>
              <Form.Item
                label="Đối tác giao hàng"
                name="shipper_code"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đối tác giao hàng",
                  },
                ]}
              >
                <CustomSelect
                  className="select-with-search"
                  showSearch
                  notFoundContent="Không tìm thấy kết quả"
                  style={{ width: "100%" }}
                  placeholder="Chọn đối tác giao hàng"
                  // suffix={
                  //   <Button
                  //     style={{ width: 36, height: 36 }}
                  //     icon={<PlusOutlined />}
                  //   />
                  // }
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
                  {shipper?.map((item, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item.code}
                    >
                      {`${item.full_name} - ${item.mobile}`}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Form.Item>

              {props.paymentMethod === PaymentMethodOption.COD && (
                <Form.Item label="Tiền thu hộ">
                  <NumberInput
                    format={(a: string) => formatCurrency(a)}
                    replace={(a: string) => replaceFormatString(a)}
                    placeholder="0"
                    value={
                      props.amount +
                      (props.shippingFeeCustomer
                        ? props.shippingFeeCustomer
                        : 0) -
                      (props.discountValue ? props.discountValue : 0)
                    }
                    style={{
                      textAlign: "right",
                      width: "100%",
                      color: "#222222",
                    }}
                    maxLength={999999999999}
                    minLength={0}
                  />
                </Form.Item>
              )}
            </Col>
            <Col md={12}>
              <Form.Item
                name="shipping_fee_paid_to_three_pls"
                label="Phí ship trả đối tác giao hàng"
              >
                <NumberInput
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="0"
                  style={{
                    textAlign: "right",
                    width: "100%",
                    color: "#222222",
                  }}
                  maxLength={15}
                  minLength={0}
                />
              </Form.Item>
              <Form.Item
                name="shipping_fee_informed_to_customer"
                label="Phí ship báo khách"
              >
                <NumberInput
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="0"
                  style={{
                    textAlign: "right",
                    width: "100%",
                    color: "#222222",
                  }}
                  maxLength={15}
                  minLength={0}
                  onChange={props.setShippingFeeInformedCustomer}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/*--- Nhận tại cửa hàng ----*/}
        <div
          className="receive-at-store"
          hidden={shipmentMethodState !== ShipmentMethodOption.PICKATSTORE}
        >
          <b>
            <img src={storeBluecon} alt="" /> THÔNG TIN CỬA HÀNG
          </b>

          <Row style={{ paddingTop: "19px" }}>
            {/* <div className="row-info-icon">
                <img src={storeBluecon} alt="" width="20px" />
              </div> */}
            <Col md={3} lg={3} xxl={2}>
              <div>Tên cửa hàng:</div>
            </Col>
            <b className="row-info-content" >
              <Typography.Link style={{ color: "#222222"}}>{props.storeDetail?.name}</Typography.Link>
            </b>
          </Row>
          <Row className="row-info padding-top-10">
            {/* <div className="row-info-icon">
                <img src={callIcon} alt="" width="18px" />
              </div> */}
            <Col md={3} lg={3} xxl={2}>
              <div>Số điện thoại:</div>
            </Col>
            <b className="row-info-content">{props.storeDetail?.hotline}</b>
          </Row>
          <Row className="row-info padding-top-10">
            {/* <div className="row-info-icon">
                <img src={locationIcon} alt="" width="18px" />
              </div> */}
            <Col md={3} lg={3} xxl={2}>
              <div>Địa chỉ:</div>
            </Col>
            <b className="row-info-content">{props.storeDetail?.address}</b>
          </Row>
        </div>

        {/*--- Giao hàng sau ----*/}
        {/* <Row className="ship-later-box" hidden={shipmentMethodState !== 4}>
          <div className="form-group m-0">
            <label htmlFor="">
              <i>Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn hàng.</i>
            </label>
          </div>
        </Row> */}
      </div>
    </Card>
  );
};

export default ShipmentCard;
