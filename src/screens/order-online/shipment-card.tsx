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
} from "antd";

import { PlusOutlined, ProfileOutlined } from "@ant-design/icons";

import callIcon from "assets/img/call.svg";
// @ts-ignore
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

type ShipmentCardProps = {
  shipmentMethod: number;
  setShipmentMethodProps: (value: number) => void;
  storeId: number | null;
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [shipmentMethodState, setshipmentMethod] = useState<number>(4);

  const ShipMethodOnChange = (value: number) => {
    setshipmentMethod(value);
    props.setShipmentMethodProps(value);
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
        <Space>
          <ProfileOutlined />
          Đóng gói và giao hàng
        </Space>
      }
    >
      <div className="padding-20">
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
                  <Radio value={1}>Chuyển đối tác giao hàng</Radio>
                  <Radio value={2}>Tự giao hàng</Radio>
                  <Radio value={3}>Nhận tại cửa hàng</Radio>
                  <Radio value={4}>Giao hàng sau</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item label="Hẹn giao" name="dating_ship">
              <DatePicker
                format="DD/MM/YYYY HH:mm A"
                style={{ width: "100%" }}
                className="r-5 w-100 ip-search"
                placeholder="Chọn ngày giao"
              />
            </Form.Item>
            <Form.Item label="Yêu cầu" name="requirements">
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
        <Divider />
        <Row gutter={20} hidden={shipmentMethodState !== 2}>
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
                    {item.full_name}
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
