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
  Checkbox,
  Input,
  Radio,
} from "antd";

import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import deliveryIcon from "assets/icon/delivery.svg";
import selfdeliver from "assets/icon/self_shipping.svg";
import shoppingBag from "assets/icon/shopping_bag.svg";
import wallClock from "assets/icon/wall_clock.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useDispatch, useSelector } from "react-redux";
import React, { useLayoutEffect, useState } from "react";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import CustomSelect from "component/custom/select.custom";
import NumberInput from "component/custom/number-input.custom";
import {
  formatCurrency,
  getShipingAddresDefault,
  replaceFormatString,
} from "utils/AppUtils";
import { PaymentMethodOption, ShipmentMethodOption } from "utils/Constants";
import imageDHL from "assets/img/imageDHL.svg";
import imageGHTK from "assets/img/imageGHTK.svg";
import imageVTP from "assets/img/imageVTP.svg";
import {
  OrderLineItemRequest,
  ShippingGHTKRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
type ShipmentCardProps = {
  shipmentMethod: number;
  setShipmentMethodProps: (value: number) => void;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  setPaymentMethod: (value: number) => void;
  storeId: number | null;
  amount: number;
  paymentMethod: number;
  shippingFeeCustomer: number | null;
  cusomerInfo: CustomerResponse | null;
  items?: Array<OrderLineItemRequest>;
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse> | null>(null);
  const [shipmentMethodState, setshipmentMethod] = useState<number>(4);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number>(0);

  const ShipMethodOnChange = (value: number) => {
    setshipmentMethod(value);
    props.setShipmentMethodProps(value);
    if (props.paymentMethod !== PaymentMethodOption.PREPAYMENT) {
      if (value === ShipmentMethodOption.SELFDELIVER) {
        props.setPaymentMethod(PaymentMethodOption.COD);
      }
    }
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );

  const getInfoDelivery = () => {
    let request: ShippingGHTKRequest = {
      pick_address: storeDetail?.address,
      pick_province: storeDetail?.city_name,
      pick_district: storeDetail?.district_name,
      province: getShipingAddresDefault(props.cusomerInfo)?.country,
      district: getShipingAddresDefault(props.cusomerInfo)?.district,
      address: getShipingAddresDefault(props.cusomerInfo)?.full_address,
      weight: null,
      value: null,
      transport: "",
    };
  };

  useLayoutEffect(() => {
    if (props.storeId != null) {
      dispatch(StoreDetailAction(props.storeId, setStoreDetail));
    }
  }, [dispatch, props.storeId]);

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

  const FAKE_DELIVER_PARTNER_DATA = [
    {
      name: "DHL",
      image: imageDHL,
      services: [
        {
          title: "Chuyển phát nhanh PDE",
          price: "18.000",
          key: "1",
        },
      ],
    },
    {
      name: "GHTK",
      image: imageGHTK,
      services: [
        {
          title: "Đường bộ",
          price: "30.000",
          key: "2",
        },
        {
          title: "Đường bay",
          price: "50.000",
          key: "3",
        },
      ],
    },
    {
      name: "VTP",
      image: imageVTP,
      services: [
        {
          title: "Chuyển phát nhanh PDE",
          price: "18.000",
          key: "4",
        },
      ],
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
      <div className="padding-24">
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
                placeholder="dd/mm/yyyy"
                disabledDate={(current: any) => current && current.valueOf() < Date.now()}
              />
            </Form.Item>
          </Col>

          <Col md={6}>
            <Form.Item>
              <Checkbox style={{ marginTop: "8px" }}>Giờ hành chính</Checkbox>
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
                <div>
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
                <Form.Item label="Tiền thu hộ:" name="shipper_code">
                  <Input placeholder="166.000" />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item label="Phí ship báo khách:" name="shipper_code">
                  <Input placeholder="20.000" />
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
                                  <Radio.Group>
                                    {single.code === "ghtk" ? (
                                      <div>
                                        <div
                                          style={{ padding: "8px 16px" }}
                                          className="custom-table__has-border-bottom custom-table__has-select-radio"
                                        >
                                          <Radio value={index}>Đường bộ</Radio>
                                        </div>
                                        <div
                                          style={{ padding: "8px 16px" }}
                                          className="custom-table__has-border-bottom custom-table__has-select-radio"
                                        >
                                          <Radio value={index}>Đường bay</Radio>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                       <Radio value={index}>Chuyển phát nhanh PDE</Radio>
                                      </div>
                                    )}
                                  </Radio.Group>
                                </td>
                                <td style={{ padding: 0, textAlign: "right" }}>
                                  {single.code === "ghtk" ? (
                                    <div>
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        100.000
                                      </div>
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        100.000
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
                      takeMoneyHelper ||
                      props.amount +
                        (props.shippingFeeCustomer
                          ? props.shippingFeeCustomer
                          : 0)
                    }
                    onChange={(value: any) => setTakeMoneyHelper(value)}
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
          <Row style={{ marginBottom: "10px" }}>Nhận tại cửa hàng</Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={storeBluecon} alt="" width="20px" />
              </div>
              <div className="row-info-title">Cửa hàng</div>
              <div className="row-info-content">
                <Typography.Link>{storeDetail?.name}</Typography.Link>
              </div>
            </Space>
          </Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={callIcon} alt="" width="18px" />
              </div>
              <div className="row-info-title">Điện thoại</div>
              <div className="row-info-content">{storeDetail?.hotline}</div>
            </Space>
          </Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={locationIcon} alt="" width="18px" />
              </div>
              <div className="row-info-title">Địa chỉ</div>
              <div className="row-info-content">{storeDetail?.address}</div>
            </Space>
          </Row>
        </div>

        {/*--- Giao hàng sau ----*/}
        <Row className="ship-later-box" hidden={shipmentMethodState !== 4}>
          <div className="form-group m-0">
            <label htmlFor="">
              <i>Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn hàng.</i>
            </label>
          </div>
        </Row>
      </div>
    </Card>
  );
};

export default ShipmentCard;
