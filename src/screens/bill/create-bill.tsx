import {Button, Select, Card, Divider, Checkbox, Input, Radio, Table, Row, Col, AutoComplete, Space, Typography} from "antd";
import {Link} from "react-router-dom";
import React from "react";
import documentIcon from "../../assets/img/document.svg";
import bithdayIcon from 'assets/img/bithday.svg';
import editBlueIcon from 'assets/img/editBlue.svg';
import deleteRedIcon from 'assets/img/deleteRed.svg';
import pointIcon from 'assets/img/point.svg';
import storeBluecon from 'assets/img/storeBlue.svg';
import dhlIcon from 'assets/img/ghtk.svg';
import ghtkIcon from 'assets/img/dhl.svg';
import callIcon from 'assets/img/call.svg';
import locationIcon from 'assets/img/location.svg';
import peopleIcon from 'assets/img/people.svg';
import truckIcon from 'assets/img/truck.svg';
import walletIcon from 'assets/img/wallet.svg';
import productIcon from 'assets/img/cube.svg';
import plusBlueIcon from 'assets/img/plus-blue.svg';
import arrowDownIcon from 'assets/img/drow-down.svg';
import warningCircleIcon from 'assets/img/warning-circle.svg';
import {  SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';

const CreateBill = () => {

  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

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

            <div className="form-group form-group-with-search form-search-customer">
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

            <Row align="middle" justify="space-between" className="row-customer-detail">
              <Row align="middle" className="customer-detail-name">
                <Space>
                  <span className="cdn-avatar"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle opacity="0.2" cx="16" cy="16" r="16" fill="#6966FF"/> <path d="M12.853 22L13.8132 19.1307H18.1882L19.1541 22H21.4041L17.3018 10.3636H14.6996L10.603 22H12.853ZM14.3814 17.4375L15.9553 12.75H16.0462L17.62 17.4375H14.3814Z" fill="#6C449F"/> </svg></span>
                  <span >Đỗ Nguyệt Anh</span>
                  <span className="cdn-level">VIP D</span>
                </Space>

              </Row>
              <Space className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt=""/>
                </span>
                <span className="customer-detail-text">0986868686</span>
              </Space>
              <Space className="customer-detail-point">
                <span className="customer-detail-icon">
                  <img src={pointIcon} alt=""/>
                </span>
                <span className="customer-detail-text">
                  Tổng điểm <Typography.Text type="success" strong>1230</Typography.Text>
                </span>
              </Space>
              <Space className="customer-detail-birthday">
                <span className="customer-detail-icon">
                  <img src={bithdayIcon} alt=""/>
                </span>
                <span className="customer-detail-text">25/04/1994</span>
              </Space>
              <Space className="customer-detail-action">
                <Button type="text" className="p-0"><img src={editBlueIcon} alt=""/></Button>
                <Button type="text" className="p-0"><img src={deleteRedIcon} alt=""/></Button>
              </Space>
            </Row>

            <Divider/>

            <div className="customer-info">
              <Row gutter={24}>
                <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
                  <div>Địa chỉ giao hàng</div>
                  <Row className="customer-row-info">
                    <img src={peopleIcon} alt="" style={{ width: 19 }} /> <span style={{ marginLeft: 9 }}>Na</span>
                  </Row>
                  <Row className="customer-row-info">
                    <img src={callIcon} alt=""/> <span>0986868686</span>
                  </Row>
                  <Row className="customer-row-info">
                    <img src={locationIcon} alt=""/> <span>YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</span>
                  </Row>
                  <Row>
                    <Button type="link" className="p-0 m-0">Thay đổi địa chỉ giao hàng</Button>
                  </Row>
                </Col>
                <Col xs={24} lg={12} className="font-weight-500">
                  <div className="form-group form-group-with-search">
                    <div>
                      <label htmlFor="" className="">Ghi chú của khách hàng</label>
                    </div>
                    <Input.TextArea placeholder="Điền ghi chú" rows={4} />
                  </div>
                </Col>
              </Row>

              <Divider/>

              <div className="send-order-box">
                <Row style={{ marginBottom: 15 }}>
                  <Checkbox className="checkbox-style" checked onChange={() => console.log(1)}>Gửi hoá đơn</Checkbox>
                </Row>
                <Row gutter={24}>
                  <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
                    <div>Địa chỉ gửi hoá đơn</div>
                    <Row className="customer-row-info">
                      <img src={peopleIcon} alt="" style={{ width: 19 }} /> <span style={{ marginLeft: 9 }}>Na</span>
                    </Row>
                    <Row className="customer-row-info">
                      <img src={callIcon} alt=""/> <span>0986868686</span>
                    </Row>
                    <Row className="customer-row-info">
                      <img src={locationIcon} alt=""/> <span>YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</span>
                    </Row>
                    <Row>
                      <Button type="link" className="p-0 m-0">Thay đổi địa chỉ gửi hoá đơn</Button>
                    </Row>
                  </Col>
                  <Col xs={24} lg={12} className="font-weight-500">
                    <div className="form-group form-group-with-search">
                      <div>
                        <label htmlFor="" className="">Email hoá đơn đến</label>
                      </div>
                      <Input placeholder="Nhập email hoá đơn đến" />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

          </Card>
          {/*--- end customer ---*/}

          <Card className="card-block sale-online-product"
                title={<div className="d-flex"><img src={productIcon} alt="" /> Sản phẩm</div>}
                extra={
                  <Row>
                    <Space>
                      <Space>
                        <Checkbox className="checkbox-style" style={{ fontSize: 14 }}
                                  onChange={() => console.log(1)}>Tách dòng</Checkbox>
                      </Space>
                      <Space>
                        <label htmlFor="">Chính sách giá</label>
                        <Select defaultValue="1" style={{ width: 130 }}>
                          <Select.Option value="1">Giá bán lẻ</Select.Option>
                          <Select.Option value="2">Giá bán buôn</Select.Option>
                        </Select>
                      </Space>
                      <Button type="link" style={{ paddingRight: 0 }}>
                        <img src={storeBluecon} alt=""/>
                        Xem tồn
                        <ArrowRightOutlined />
                      </Button>
                    </Space>
                  </Row>
                }>
            <Row gutter={24}>
              <Col xs={24} lg={8}>
                <div className="form-group form-group-with-search">
                  <label htmlFor="" className="">Cửa hàng</label>
                  {/*<Input placeholder="Chuyển Khoản"*/}
                  {/*       suffix={<img src={arrowDownIcon} alt="down" />}*/}
                  {/*/>*/}

                  <Select className="select-with-search" showSearch
                          style={{ width: '100%' }}
                          placeholder=""
                  >
                    <Select.Option value="1">YODY Kho Online</Select.Option>
                    <Select.Option value="2">YODY Tứ Kỳ</Select.Option>
                    <Select.Option value="3">YODY Nam Sách</Select.Option>
                    <Select.Option value="4">YODY Hải Dương</Select.Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} lg={16}>
                <div className="form-group form-group-with-search">
                  <label htmlFor="" className="">Sản phẩm</label>
                  <div>
                    <AutoComplete>
                      <Input
                        placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                        prefix={<SearchOutlined style={{ color: '#ABB4BD' }} />}
                      />
                    </AutoComplete>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sale-product-box">
              <Table
                locale={{
                  emptyText: 'Không có sản phẩm'
                }}
                className="sale-product-box-table"
                // rowKey={(record) => record.id}
                dataSource={dataSource}
                tableLayout="fixed"
                columns={columns}
                pagination={false}
                // scroll={{ y: 300 }} sticky
              />
            </Row>
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

            <Divider/>

            <Row>
              <div className="form-group form-group-with-search">
                <label htmlFor="" className="">Phí ship báo khách</label>
                <Input placeholder="" alt="down"/>
              </div>
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

            <Divider/>

            <div className="payment-method-content">
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Hình thức thanh toán</label>
                    {/*<Input placeholder="Chuyển Khoản"*/}
                    {/*       suffix={<img src={arrowDownIcon} alt="down" />}*/}
                    {/*/>*/}

                    <Select className="select-with-search" showSearch
                      style={{ width: '100%' }}
                      placeholder=""
                    >
                      <Select.Option value="1">Chuyển khoản</Select.Option>
                      <Select.Option value="2">COD</Select.Option>
                      <Select.Option value="3">Communicated</Select.Option>
                      <Select.Option value="4">Identified</Select.Option>
                    </Select>
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