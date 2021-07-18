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
  Button,
  Tabs,
  Checkbox,
} from "antd";

import { PlusOutlined } from "@ant-design/icons";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import deliveryIcon from "../../assets/icon/delivery.svg";
import selfdeliver from "../../assets/icon/self_shipping.svg";
import shoppingBag from "../../assets/icon/shopping_bag.svg";
import wallClock from "../../assets/icon/wall_clock.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useDispatch, useSelector } from "react-redux";
import { useLayoutEffect, useState } from "react";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import CustomSelect from "component/custom/select.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PaymentMethodOption, ShipmentMethodOption } from "utils/Constants";
const { TabPane } = Tabs;
type ShipmentCardProps = {
  shipmentMethod: number;
  setShipmentMethodProps: (value: number) => void;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  setPaymentMethod: (value: number) => void;
  storeId: number | null;
  amount: number;
  paymentMethod: number;
  shippingFeeCustomer: number | null;
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [shipmentMethodState, setshipmentMethod] = useState<number>(4);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number>(0);

  const ShipMethodOnChange = (value: number) => {
    setshipmentMethod(value);
    props.setShipmentMethodProps(value);
    if (value === ShipmentMethodOption.SELFDELIVER)
      props.setPaymentMethod(PaymentMethodOption.COD);
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );

  useLayoutEffect(() => {
    if (props.storeId != null) {
      dispatch(StoreDetailAction(props.storeId, setStoreDetail));
    }
  }, [dispatch, props.storeId]);

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);
  // shipment button action
  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: string | undefined;
  }

  const [shipmentButton, setShipmentButton] = useState<
    Array<ShipmentButtonModel>
  >([
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
  ]);

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
                format="DD/MM/YYYY HH:mm A"
                style={{ width: "100%" }}
                className="r-5 w-100 ip-search"
                placeholder="Chọn ngày giao"
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
                notFoundContent="Không có dữ liệu"
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
            {shipmentButton.map((button) => (
              <Space>
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
                      props.shipmentMethod === ShipmentMethodOption.DELIVERLATER
                        ? "saleorder_shipment_button saleorder_shipment_button_border"
                        : "saleorder_shipment_button_active"
                    }
                    key={button.value}
                  >
                    <img src={button.icon} alt="icon"></img>
                    <span>{button.name}</span>
                  </div>
                )}
              </Space>
            ))}
          </div>
        </Row>
        <Row
          gutter={20}
          hidden={shipmentMethodState !== ShipmentMethodOption.SELFDELIVER}
        >
          <Col md={12}>
            <Form.Item
              label="Đối tác giao hàng"
              name="delivery_service_provider_id"
            >
              <CustomSelect
                className="select-with-search"
                showSearch
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: "100%" }}
                placeholder="Chọn đối tác giao hàng"
                suffix={
                  <Button
                    style={{ width: 36, height: 36 }}
                    icon={<PlusOutlined />}
                  />
                }
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
                    value={item.id}
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
              name="shipping_fee_paid_to_3pls"
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

        {/*--- Nhận tại cửa hàng ----*/}
        <div className="receive-at-store" hidden={shipmentMethodState !== 3}>
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
