import {Button, Card, Form, Input, Radio, Table, Row, Col, AutoComplete, Space} from "antd";
import {Link} from "react-router-dom";
import React from "react";
import documentIcon from "../../assets/img/document.svg";
import peopleIcon from 'assets/img/people.svg';
import truckIcon from 'assets/img/truck.svg';
import walletIcon from 'assets/img/wallet.svg';
import productIcon from 'assets/img/cube.svg';
import plusBlueIcon from 'assets/img/plus-blue.svg';
import arrowDownIcon from 'assets/img/drow-down.svg';
import warningCircleIcon from 'assets/img/warning-circle.svg';
import {  SearchOutlined } from '@ant-design/icons';

const CreateBill = () => {
  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          <Card className="card-block"
                title={<div className="d-flex"><img src={peopleIcon} alt="" /> Khách hàng</div>}
                extra={
                  <div className="d-flex align-items-center form-group-with-search">
                    <label htmlFor="" className="required-label">Nguồn</label>
                    <Input.Search
                      placeholder="Chọn nguồn đơn hàng"
                      enterButton={<Button type="text"><img src={plusBlueIcon} alt="" /></Button>}
                      suffix={<img src={arrowDownIcon} alt="down" />}
                      onSearch={() => console.log(1)}
                    />
                  </div>
                }>

            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Tên khách hàng</label>
              <div>
                <AutoComplete>
                  <Input.Search
                    placeholder="Tìm hoặc thêm khách hàng"
                    enterButton={<Button type="text"><img src={plusBlueIcon} alt="" /></Button>}
                    prefix={<SearchOutlined style={{ color: '#ABB4BD' }} />}
                    onSearch={() => console.log(1)}
                  />
                </AutoComplete>
              </div>
            </div>
          </Card>
          {/*--- end customer ---*/}

          <Card className="card-block"
                title={<div className="d-flex"><img src={productIcon} alt="" /> Sản phẩm</div>}
                extra={<a href="#">More</a>}>
            <p>Card content</p>
          </Card>

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={truckIcon} alt="" /> Đóng gói và giao hàng</div>}>
            <Row gutter={24} className="">
              <Col xs={24} lg={12}>
                <div><label htmlFor="" className="required-label"><i>Lựa chọn 1 trong hình thức giao hàng</i></label></div>
                <div style={{ marginTop: 15 }}>
                  <Radio.Group value={1}>
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
          </Card>

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={walletIcon} alt="" /> Thanh toán</div>}
          >
            <div className="payment-method-radio-list">
              <label htmlFor="" className="required-label"><i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i></label>
              <div style={{ marginTop: 15 }}>
                <Radio.Group name="radiogroup" defaultValue={1}>
                  <Radio value={1}>COD</Radio>
                  <Radio value={2}>Thanh toán trước</Radio>
                  <Radio value={3}>Thanh toán sau</Radio>
                </Radio.Group>
              </div>
            </div>

            <div className="payment-method-content">
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Hình thức thanh toán</label>
                    <Input placeholder="Chuyển Khoản"
                           suffix={<img src={arrowDownIcon} alt="down" />}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Số tiền</label>
                    <Input placeholder="Chuyển Khoản"/>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Ngày chuyển khoản</label>
                    <Input placeholder="Ngày chuyển khoản"
                           suffix={<img src={arrowDownIcon} alt="down" />}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Tham chiếu</label>
                    <Input placeholder="Nhập tham chiếu"/>
                  </div>
                </Col>
                <Col span={24}>
                  <Button type="link" className="p-0">Thêm hình thức thanh toán</Button>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={7}>
          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={documentIcon} alt="" /> Thông tin đơn hàng</div>}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="required-label">Nhân viên bán hàng</label>
              <Input placeholder="Tìm tên/ mã nhân viên"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
            <div className="form-group form-group-with-search">
              <div><label htmlFor="" className="">Tham chiếu</label> <span><img src={warningCircleIcon} alt="" /></span></div>
              <Input placeholder="Điền tham chiếu"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div><label htmlFor="" className="">Đường dẫn</label> <span><img src={warningCircleIcon} alt="" /></span></div>
              <Input placeholder="Điền đường dẫn"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
          </Card>

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={documentIcon} alt="" /> Thông tin bổ sung</div>}>
            <div className="form-group form-group-with-search">
              <div><label htmlFor="" className="">Ghi chú</label> <span><img src={warningCircleIcon} alt="" /></span></div>
              <Input.TextArea placeholder="Điền ghi chú" />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div><label htmlFor="" className="">Tag</label> <span><img src={warningCircleIcon} alt="" /></span></div>
              <Input placeholder="Thêm tag" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button type="default" className="btn-style btn-save">Lưu</Button>
      </Row>
    </div>
  )
}

export default CreateBill;