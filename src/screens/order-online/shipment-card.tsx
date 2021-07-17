// @ts-ignore
import {
  Card,
  Divider,
  Row,
  Col,
  Space,
  Typography,
  Radio,
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
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [shipmentMethodState, setshipmentMethod] = useState<number>(4);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);

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
        <Row gutter={24}>
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
              <Checkbox style={{marginTop: "8px"}}>Giờ hành chính</Checkbox>
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

        {/* 
        <Tabs type="card">
          <TabPane tab="Tab 1" key="1">
            Content of Tab Pane 1
          </TabPane>
          <TabPane tab="Tab 2" key="2">
            Content of Tab Pane 2
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            Content of Tab Pane 3
          </TabPane>
          <TabPane tab="Tab 4" key="4">
            Content of Tab Pane 3
          </TabPane>
        </Tabs> */}

        <Row gutter={20}>
          <Col md={12}>
            <Form.Item
              label={
                <i style={{ marginBottom: "15px" }}>
                  Lựa chọn 1 trong hình thức giao hàng
                </i>
              }
              required
            >
              <Radio.Group
                value={props.shipmentMethod}
                onChange={(e) => ShipMethodOnChange(e.target.value)}
              >
                <Space direction="vertical" size={15}>
                  <Radio value={ShipmentMethodOption.DELIVERPARNER}>
                    Chuyển đối tác giao hàng
                  </Radio>
                  <Radio value={ShipmentMethodOption.SELFDELIVER}>
                    Tự giao hàng
                  </Radio>
                  <Radio value={ShipmentMethodOption.PICKATSTORE}>
                    Nhận tại cửa hàng
                  </Radio>
                  <Radio value={ShipmentMethodOption.DELIVERLATER}>
                    Giao hàng sau
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Divider />
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
          </Col>
          <Col md={12}>
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
            {props.paymentMethod === PaymentMethodOption.COD && (
              <Form.Item label="Tiền thu hộ">
                <NumberInput
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="0"
                  value={takeMoneyHelper || props.amount}
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
