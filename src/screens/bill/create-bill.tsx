import {Button, Select, Card, Divider, Checkbox, Input, Radio, Table, Row, Col, Dropdown, Menu,
  Tooltip, AutoComplete, Space, Typography, Descriptions, Popover, InputNumber} from "antd";
import React, {useCallback, useState} from "react";
import documentIcon from "../../assets/img/document.svg";
import bithdayIcon from 'assets/img/bithday.svg';
import editBlueIcon from 'assets/img/editBlue.svg';
import deleteRedIcon from 'assets/img/deleteRed.svg';
import pointIcon from 'assets/img/point.svg';
import storeBluecon from 'assets/img/storeBlue.svg';
import dhlIcon from 'assets/img/dhl.svg';
import ghtkIcon from 'assets/img/ghtk.svg';
import callIcon from 'assets/img/call.svg';
import locationIcon from 'assets/img/location.svg';
import peopleIcon from 'assets/img/people.svg';
import truckIcon from 'assets/img/truck.svg';
import walletIcon from 'assets/img/wallet.svg';
import plusBlueIcon from 'assets/img/plus-blue.svg';
import arrowDownIcon from 'assets/img/drow-down.svg';
import warningCircleIcon from 'assets/img/warning-circle.svg';
import {  SearchOutlined } from '@ant-design/icons';
import { formatCurrency, replaceFormat } from "../../utils/AppUtils";
import AddAddressModal from "../../component/OrderOnline/addAddressModal";
import EditCustomerModal from "../../component/OrderOnline/editCustomerModal";
import ProductCard from "../../component/OrderOnline/productCard";

const CreateBill = () => {
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const showAddressModal = () => {
    setVisibleAddress(true);
  };
  const onCancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);
  const onOkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const showCustomerModal = () => {
    setVisibleCustomer(true);
  };
  const onCancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);
  const onOkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const showBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };

  const [selectedShipMethod, setSelectedShipMethod ] = useState(1);
  const changeShipMethod = (value: number) => {
    setSelectedShipMethod(value);
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod ] = useState(1);
  const changePaymentMethod = (value: number) => {
    setSelectedPaymentMethod(value);
  };

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          <Card className="card-block card-block-customer"
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
                <Button type="text" className="p-0" onClick={showCustomerModal}><img src={editBlueIcon} alt=""/></Button>
                <Button type="text" className="p-0"><img src={deleteRedIcon} alt=""/></Button>
              </Space>
            </Row>

            <Divider/>

            <div className="customer-info">
              <Row gutter={24}>
                <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
                  <div>Địa chỉ giao hàng</div>
                  <Row className="row-info customer-row-info">
                    <img src={peopleIcon} alt="" style={{ width: 19 }} /> <span style={{ marginLeft: 9 }}>Na</span>
                  </Row>
                  <Row className="row-info customer-row-info">
                    <img src={callIcon} alt=""/> <span>0986868686</span>
                  </Row>
                  <Row className="row-info customer-row-info">
                    <img src={locationIcon} alt=""/> <span>YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</span>
                  </Row>
                  <Row>
                    <Popover placement="bottomLeft"
                             title={
                               <Row justify="space-between" align="middle" className="change-shipping-address-title">
                                 <div style={{color: '#4F687D'}}>Thay đổi địa chỉ</div>
                                 <Button type="link" onClick={showAddressModal}>Thêm địa chỉ mới</Button>
                               </Row>
                             }
                             content={
                               <div className="change-shipping-address-content">
                                 <div className="shipping-address-row">
                                   <div className="shipping-address-name">
                                     Địa chỉ 1 <Button type="text" onClick={showAddressModal} className="p-0"><img src={editBlueIcon} alt=""/></Button>
                                   </div>
                                   <div className="shipping-customer-name">Nguyệt Anh String</div>
                                   <div className="shipping-customer-mobile">0986868686</div>
                                   <div className="shipping-customer-address">YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</div>
                                 </div>

                                 <div className="shipping-address-row">
                                   <div className="shipping-address-name">
                                     Địa chỉ 2 <Button type="text" onClick={showAddressModal} className="p-0"><img src={editBlueIcon} alt=""/></Button>
                                   </div>
                                   <div className="shipping-customer-name">Nguyệt Anh String</div>
                                   <div className="shipping-customer-mobile">0986868686</div>
                                   <div className="shipping-customer-address">YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</div>
                                 </div>
                               </div>
                             }
                             className="change-shipping-address">
                      <Button type="link" className="p-0 m-0" >Thay đổi địa chỉ giao hàng</Button>
                    </Popover>
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
                  <Checkbox className="checkbox-style" onChange={showBillingAddress}>Gửi hoá đơn</Checkbox>
                </Row>
                <Row gutter={24} hidden={isVisibleBilling}>
                  <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
                    <div>Địa chỉ gửi hoá đơn</div>
                    <Row className="row-info customer-row-info">
                      <img src={peopleIcon} alt="" style={{ width: 19 }} /> <span style={{ marginLeft: 9 }}>Na</span>
                    </Row>
                    <Row className="row-info customer-row-info">
                      <img src={callIcon} alt=""/> <span>0986868686</span>
                    </Row>
                    <Row className="row-info customer-row-info">
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

          <ProductCard />

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

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={walletIcon} alt="" /> Thanh toán</div>}>
            <div className="payment-method-radio-list">
              <label htmlFor="" className="required-label"><i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i></label>
              <div style={{ marginTop: 15 }}>
                <Radio.Group name="radiogroup" value={selectedPaymentMethod} onChange={(e) => changePaymentMethod(e.target.value)}>
                  <Radio value={1}>COD</Radio>
                  <Radio value={2}>Thanh toán trước</Radio>
                  <Radio value={3}>Thanh toán sau</Radio>
                </Radio.Group>
              </div>
            </div>

            <Divider/>

            <div className="payment-method-content">
              <Row gutter={24} className="payment-cod-box" hidden={selectedPaymentMethod !== 1}>
                <Col xs={24} lg={12}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">Tiền thu hộ</label>
                    <div>
                      <InputNumber min={0} placeholder="Nhập số tiền" className="text-right hide-handler-wrap w-100"/>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={24} hidden={selectedPaymentMethod !== 2}>
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

              <Row className="payment-later-box" hidden={selectedPaymentMethod !== 3}>
                <div className="form-group m-0">
                  <label htmlFor=""><i>Bạn có thể xử lý thanh toán sau khi tạo đơn hàng.</i></label>
                </div>
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
              <div>
                <label htmlFor="" className="">Tham chiếu</label>
                <Tooltip title="Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Điền tham chiếu" suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div>
                <label htmlFor="" className="">Đường dẫn</label>
                <Tooltip title="Thêm đường dẫn đơn hàng gốc trên kênh bán hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Điền đường dẫn"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
          </Card>

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={documentIcon} alt="" /> Thông tin bổ sung</div>}>
            <div className="form-group form-group-with-search">
              <div>
                <label htmlFor="" className="">Ghi chú</label>
                <Tooltip title="Thêm thông tin ghi chú chăm sóc khách hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input.TextArea placeholder="Điền ghi chú" />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div>
                <label htmlFor="" className="">Tag</label>
                <Tooltip title="Thêm từ khóa để tiện lọc đơn hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Thêm tag" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button type="default" className="btn-style btn-save">Lưu</Button>
      </Row>

      <AddAddressModal visible={isVisibleAddress} onCancel={onCancleConfirmAddress} onOk={onOkConfirmAddress} />
      <EditCustomerModal visible={isVisibleCustomer} onCancel={onCancleConfirmCustomer} onOk={onOkConfirmCustomer} />
    </div>
  )
}

export default CreateBill;