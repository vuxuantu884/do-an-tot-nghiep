// @ts-ignore
import {
  Card,
  Divider,
  Row,
  Col,
  Space,
  Typography,
  Radio,
  InputNumber,
  Select,
  DatePicker,
} from "antd";

import callIcon from "assets/img/call.svg";
// @ts-ignore
import locationIcon from "assets/img/location.svg";
import truckIcon from "../../assets/img/truck.svg";
import dhlIcon from "../../assets/img/dhl.svg";
import { formatCurrency } from "../../utils/AppUtils";
import ghtkIcon from "../../assets/img/ghtk.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useDispatch, useSelector } from "react-redux";
import { Moment } from "moment";
import { useLayoutEffect, useState } from "react";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { ShipperGetListAction } from "domain/actions/account/account.action";

type ShipmentCardProps = {
  shipmentMethod: number;
  SelectedShipmentType: (paymentType: number) => void;
  ShipFeeCustomer: (item: number) => void;
  ShipDeliveryFee: (item: number) => void;
  RequirementShip: (item: string) => void;
  ShipDeliveryPartner : (item: number) => void;
  storeId: number | null;
};

const ShipmentCard: React.FC<ShipmentCardProps> = (
  props: ShipmentCardProps
) => {
  const dispatch = useDispatch();
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);

  const ShipMethodOnChange = (value: number) => {
    props.SelectedShipmentType(value);
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );

  const changeShipFeeCustomer = (value: number) => {
    props.ShipFeeCustomer(value);
  };

  const changeShipFeeHvc = (value: number) => {
    props.ShipDeliveryFee(value);
  };

  const ChangeShippingRequirement = (value: string) => {
    props.RequirementShip(value);
  };

  const ChangeDeliveryPartner = (value: number) => {
    props.ShipDeliveryPartner(value);
  };

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
          <img src={truckIcon} alt="" /> Đóng gói và giao hàng
        </div>
      }
    >
      <div className="padding-20">
        <Row gutter={24} className="">
          <Col xs={24} lg={12}>
            <div>
              <label htmlFor="" className="required-label">
                <i>Lựa chọn 1 trong hình thức giao hàng</i>
              </label>
            </div>
            <div style={{ marginTop: 15 }}>
              <Radio.Group
                value={props.shipmentMethod}
                onChange={(e) => ShipMethodOnChange(e.target.value)}
              >
                <Space direction="vertical">
                  <Radio value={1}>Chuyển đối tác giao hàng</Radio>
                  <Radio value={2}>Tự giao hàng</Radio>
                  <Radio value={3}>Nhận tại cửa hàng</Radio>
                  <Radio value={4}>Giao hàng sau</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">
                Hẹn giao
              </label>

              <DatePicker
                className="r-5 w-100 ip-search"
                placeholder="Ngày tạo từ"
              />
            </div>
            <div className="form-group form-group-with-search">
              <div>
                <label htmlFor="" className="">
                  Yêu cầu
                </label>
              </div>
              <Select
                className="select-with-search"
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn yêu cầu"
                onChange={ChangeShippingRequirement}
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
            </div>
          </Col>
        </Row>

        <Divider />

        <div>
          {/*--- đối tác ----*/}
          <Row
            gutter={24}
            className="ship-box"
            hidden={props.shipmentMethod !== 1}
          >
            <Col xs={24} lg={12}>
              <div className="form-group form-group-with-search">
                <label htmlFor="" className="">
                  Phí ship báo khách
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Phí ship báo khách"
                />
              </div>
            </Col>

            <Col span={24}>
              <div className="table-ship w-100">
                <div className="custom-table">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Hãng vận chuyển</th>
                        <th>Dịch vụ chuyển phát</th>
                        <th>Cước phí</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <img src={dhlIcon} alt="" />
                        </td>
                        <td>
                          <Radio value={1}>Chuyển phát nhanh PDE</Radio>
                        </td>
                        <td>
                          <Typography.Text type="success">
                            {formatCurrency(18000)}
                          </Typography.Text>
                        </td>
                      </tr>

                      <tr>
                        <td style={{ borderBottom: 0 }}>
                          <img src={ghtkIcon} alt="" />
                        </td>
                        <td>
                          <Radio value={2}>Đường bộ</Radio>
                        </td>
                        <td>{formatCurrency(30000)}</td>
                      </tr>

                      <tr>
                        <td style={{ borderTop: 0 }} />
                        <td>
                          <Radio value={3}>Đường bay</Radio>
                        </td>
                        <td>{formatCurrency(50000)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>
          </Row>

          {/*--- Tự giao hàng ----*/}
          <Row
            gutter={24}
            className="ship-cod"
            hidden={props.shipmentMethod !== 2}
          >
            <Col xs={24} lg={12}>
              <div className="form-group form-group-with-search form-search-customer">
                <label htmlFor="" className="">
                  Đối tác giao hàng
                </label>
                <div>
                  <Select
                    className="select-with-search"
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="Chọn đối tác giao hàng"
                    onChange={ChangeDeliveryPartner}
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
                      <Select.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.id}
                      >
                        {item.full_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="form-group form-group-with-search form-search-customer">
                <label htmlFor="" className="">
                  Phí ship báo khách
                </label>
                <div>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={9999999999}
                    placeholder="Phí ship báo khách"
                    onChange={changeShipFeeCustomer}
                  />
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="form-group form-group-with-search form-search-customer">
                <label htmlFor="" className="">
                  Phí ship trả đối tác giao hàng
                </label>
                <div>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={9999999999999}
                    placeholder="Phí ship trả đối tác giao hàng"
                    onChange={changeShipFeeHvc}
                  />
                </div>
              </div>
            </Col>
          </Row>

          {/*--- Nhận tại cửa hàng ----*/}
          <div className="receive-at-store" hidden={props.shipmentMethod !== 3}>
            <Row>Nhận tại cửa hàng</Row>
            <Row className="row-info">
              <Space>
                <div className="row-info-icon">
                  <img src={storeBluecon} alt="" />
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
                  <img src={callIcon} alt="" />
                </div>
                <div className="row-info-title">Điện thoại</div>
                <div className="row-info-content">{storeDetail?.hotline}</div>
              </Space>
            </Row>
            <Row className="row-info">
              <Space>
                <div className="row-info-icon">
                  <img src={locationIcon} alt="" />
                </div>
                <div className="row-info-title">Địa chỉ</div>
                <div className="row-info-content">{storeDetail?.address}</div>
              </Space>
            </Row>
          </div>

          {/*--- Giao hàng sau ----*/}
          <Row className="ship-later-box" hidden={props.shipmentMethod !== 4}>
            <div className="form-group m-0">
              <label htmlFor="">
                <i>Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn hàng.</i>
              </label>
            </div>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default ShipmentCard;
