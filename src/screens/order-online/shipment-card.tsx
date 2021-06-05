// @ts-ignore
import {
  Button,
  Card,
  Divider,
  Input,
  Row,
  Col,
  AutoComplete,
  Space,
  Typography,
  Radio,
  InputNumber
} from "antd";

// @ts-ignore
import React, { useState} from "react";

// @ts-ignore
import plusBlueIcon from 'assets/img/plus-blue.svg';
// @ts-ignore
import arrowDownIcon from 'assets/img/drow-down.svg';
// @ts-ignore
import callIcon from 'assets/img/call.svg';
// @ts-ignore
import locationIcon from 'assets/img/location.svg';

import {  SearchOutlined } from '@ant-design/icons';
import truckIcon from "../../assets/img/truck.svg";
import dhlIcon from "../../assets/img/dhl.svg";
import {formatCurrency} from "../../utils/AppUtils";
import ghtkIcon from "../../assets/img/ghtk.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";


type ShipmentCardProps = {
  // visible: boolean;
  // onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  // onOk: () => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = (props: ShipmentCardProps) => {

  const [selectedShipMethod, setSelectedShipMethod ] = useState(1);
  const changeShipMethod = (value: number) => {
    setSelectedShipMethod(value);
  };

  return (
    <Card className="card-block card-block-normal"
          title={<div className="d-flex"><img src={truckIcon} alt="" /> Đóng gói và giao hàng</div>}>
      <Row gutter={24} className="">
        <Col xs={24} lg={12}>
          <div><label htmlFor="" className="required-label"><i>Lựa chọn 1 trong hình thức giao hàng</i></label></div>
          <div style={{ marginTop: 15 }}>
            <Radio.Group value={selectedShipMethod} onChange={(e) => changeShipMethod(e.target.value)}>
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
            <label htmlFor="" className="">Hẹn giao</label>
            <Input placeholder="Chọn ngày giao"
                   suffix={<img src={arrowDownIcon} alt="down" />}
            />
          </div>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Yêu cầu</label>
            <Input placeholder="Cho phép xem hàng và thử hàng"
                   suffix={<img src={arrowDownIcon} alt="down" />}
            />
          </div>
        </Col>
      </Row>

      <Divider/>

      <div>
        {/*--- đối tác ----*/}
        <Row gutter={24} className="ship-box" hidden={selectedShipMethod !== 1}>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Phí ship báo khách</label>
              <InputNumber placeholder="" className="text-right hide-handler-wrap w-100"/>
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
                    <td><img src={dhlIcon} alt=""/></td>
                    <td><Radio value={1}>Chuyển phát nhanh PDE</Radio></td>
                    <td><Typography.Text type="success">{formatCurrency(18000)}</Typography.Text></td>
                  </tr>

                  <tr>
                    <td style={{ borderBottom:0 }}>
                      <img src={ghtkIcon} alt=""/>
                    </td>
                    <td>
                      <Radio value={2}>Đường bộ</Radio>
                    </td>
                    <td>{formatCurrency(30000)}</td>
                  </tr>

                  <tr>
                    <td style={{ borderTop:0 }}/>
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
        <Row gutter={24} className="ship-cod" hidden={selectedShipMethod !== 2}>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search form-search-customer">
              <label htmlFor="" className="">Đối tác giao hàng</label>
              <div>
                <AutoComplete>
                  <Input.Search
                    placeholder="Chọn đối tác giao hàng"
                    enterButton={<Button type="text"><img src={plusBlueIcon} alt="" /></Button>}
                    prefix={<SearchOutlined style={{ color: '#ABB4BD' }} />}
                    onSearch={() => console.log(1)}
                    suffix={<img src={arrowDownIcon} alt="down" />}
                  />
                </AutoComplete>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search form-search-customer">
              <label htmlFor="" className="">Phí ship báo khách</label>
              <div>
                <InputNumber placeholder="Nhập số tiền" className="text-right hide-handler-wrap w-100"/>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search form-search-customer">
              <label htmlFor="" className="">Phí ship trả đối tác giao hàng</label>
              <div>
                <InputNumber placeholder="Nhập số tiền" className="text-right hide-handler-wrap w-100"/>
              </div>
            </div>
          </Col>
        </Row>

        {/*--- Nhận tại cửa hàng ----*/}
        <div className="receive-at-store" hidden={selectedShipMethod !== 3}>
          <Row>Nhận tại cửa hàng</Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={storeBluecon} alt=""/>
              </div>
              <div className="row-info-title">Cửa hàng</div>
              <div className="row-info-content"><Typography.Link>YODY Kho Online</Typography.Link></div>
            </Space>
          </Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={callIcon} alt=""/>
              </div>
              <div className="row-info-title">Điện thoại</div>
              <div className="row-info-content">0968563666</div>
            </Space>
          </Row>
          <Row className="row-info">
            <Space>
              <div className="row-info-icon">
                <img src={locationIcon} alt=""/>
              </div>
              <div className="row-info-title">Địa chỉ</div>
              <div className="row-info-content">Khu Tiểu Thủ CN Gia Xuyên - Phố ĐInh Lễ - Xã Gia Xuyên - TP Hải Dương</div>
            </Space>
          </Row>
        </div>

        {/*--- Giao hàng sau ----*/}
        <Row className="ship-later-box" hidden={selectedShipMethod !== 4}>
          <div className="form-group m-0">
            <label htmlFor=""><i>Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn hàng.</i></label>
          </div>
        </Row>

      </div>
    </Card>
  )
}

export default ShipmentCard;
