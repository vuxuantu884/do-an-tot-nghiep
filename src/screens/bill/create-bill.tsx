import {
  Button,
  Select,
  Card,
  Divider,
  Checkbox,
  Input,
  Radio,
  Table,
  Row,
  Col,
  Dropdown,
  Menu,
  Tooltip,
  AutoComplete,
  Space,
  Typography,
  Descriptions,
  Popover,
  InputNumber,
  Form,
} from "antd";
import documentIcon from "../../assets/img/document.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import deleteRedIcon from "assets/img/deleteRed.svg";
import pointIcon from "assets/img/point.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import dhlIcon from "assets/img/ghtk.svg";
import ghtkIcon from "assets/img/dhl.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import peopleIcon from "assets/img/people.svg";
import truckIcon from "assets/img/truck.svg";
import walletIcon from "assets/img/wallet.svg";
import productIcon from "assets/img/cube.svg";
import plusBlueIcon from "assets/img/plus-blue.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import warningCircleIcon from "assets/img/warning-circle.svg";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  formatCurrency,
  replaceFormat,
  haveAccess,
} from "../../utils/AppUtils";
import AddAddressModal from "./component/addAddressModal";
import EditCustomerModal from "./component/editCustomerModal";
import DiscountGroup from "./component/discountGroup";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useDispatch, useSelector } from "react-redux";
import { StoreModel } from "model/other/StoreModel";
import { getListStoreRequest } from "domain/actions/store.action";
import { getListSourceRequest } from "domain/actions/orderOnline.action";
import { SourceModel } from "model/other/SourceModel";

const CreateBill = () => {
  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [listStores, setListStores] = useState<Array<StoreModel>>([]);
  const [listSource, setListSource] = useState<Array<SourceModel>>([]);

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

  const OrderItemModel = [{}];

  const ProductColumn = {
    title: "Sản phẩm",
    className: "yody-pos-name",
    // width: 210,
    render: (index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <Button
              onClick={() => console.log(1)}
              className="yody-pos-delete-item"
            >
              <img src={deleteRedIcon} alt="" />
            </Button>
            <div style={{ width: "calc(100% - 32px)" }}>
              <div className="yody-pos-sku">
                <Typography.Link>APN3340 - XXA - XL</Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip
                  title="Polo mắt chim nữ - xanh xám - XL"
                  className="yody-pos-varian-name"
                >
                  <span>Polo mắt chim nữ - xanh xám - XL</span>
                </Tooltip>
                {/*<Button hidden={!(!a.show_note && a.note === '')} type="text" className="text-primary text-add-note" onClick={() => {*/}
                {/*  window.requestAnimationFrame(() => setFocus(index));*/}
                {/*  dispatch(showNoteAction(index))}}>Thêm ghi chú</Button>*/}
              </div>
            </div>
          </div>

          {/*{*/}
          {/*  a.gifts.map((a, index1) => (*/}
          {/*    <div key={index1} className="yody-pos-addition yody-pos-gift">*/}
          {/*      <div><img src={giftIcon} alt=""/> {a.variant} <span>({a.quantity})</span></div>*/}
          {/*    </div>*/}
          {/*  ))*/}
          {/*}*/}

          {/*<div className="yody-pos-note" hidden={!a.show_note && a.note === ''}>*/}
          {/*  <Input*/}
          {/*    addonBefore={<EditOutlined />}*/}
          {/*    maxLength={255}*/}
          {/*    allowClear={true}*/}
          {/*    onBlur={() => {*/}
          {/*      if(a.note === '') {*/}
          {/*        dispatch(hideNoteAction(index))*/}
          {/*      }*/}
          {/*    }}*/}
          {/*    className="note"*/}
          {/*    value={a.note}*/}
          {/*    onChange={(e) => dispatch(onOrderItemNoteChange(index, e.target.value))}*/}
          {/*    placeholder="Ghi chú" />*/}
          {/*</div>*/}
        </div>
      );
    },
  };

  const AmountColumnt = {
    title: () => (
      <div>
        <div>Số lượng</div>
        <span style={{ color: "#0080FF" }}>(3)</span>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    // width: 80,
    render: (index: number) => {
      return (
        <div className="yody-pos-qtt">
          <Input
            onChange={(e) => console.log(1)}
            value={3}
            minLength={1}
            maxLength={4}
            onFocus={(e) => e.target.select()}
            style={{ width: 60, textAlign: "right" }}
          />
        </div>
      );
    },
  };

  const PriceColumnt = {
    title: "Đơn giá",
    className: "yody-pos-price text-right",
    // width: 100,
    render: (index: number) => {
      return (
        <div className="yody-pos-price">
          <InputNumber
            className="hide-number-handle"
            min={0}
            // formatter={value => formatCurrency(value ? value : '0')}
            // parser={value => replaceFormat(value ? value : '0')}
            value={100000}
            onChange={(e) => console.log(1)}
            onFocus={(e) => e.target.select()}
            style={{ maxWidth: 100, textAlign: "right" }}
          />
        </div>
      );
    },
  };

  const DiscountColumnt = {
    title: "Chiết khấu",
    // align: 'center',
    width: 115,
    className: "yody-table-discount text-center",
    render: (index: number) => {
      return (
        <div className="site-input-group-wrapper">
          <DiscountGroup
            index={index}
            discountRate={0}
            discountValue={0}
            totalAmount={0}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    className: "yody-table-total-money text-right",
    // width: 100,
    render: () => {
      return <div>1000000</div>;
    },
  };

  const ActionColumn = {
    title: "Thao tác",
    width: 80,
    className: "yody-table-action text-center",
    render: (index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu">
          <Menu.Item key="0">
            <Button type="text" className="p-0 m-0 w-100">
              Thêm quà tặng
            </Button>
          </Menu.Item>
          <Menu.Item key="1">
            <Button type="text" className="p-0 m-0 w-100">
              Thêm ghi chú
            </Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="site-input-group-wrapper">
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              className="ant-dropdown-link circle-button yody-pos-action"
              onClick={(e) => console.log(1)}
            >
              <img src={arrowDownIcon} alt="" />
            </Button>
          </Dropdown>
        </div>
      );
    },
  };
  const columns = [
    ProductColumn,
    AmountColumnt,
    PriceColumnt,
    DiscountColumnt,
    TotalPriceColumn,
    ActionColumn,
  ];

  useLayoutEffect(() => {
    dispatch(getListStoreRequest(setListStores));
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreModel> = [];
    if (listStores && listStores != null) {
      newData = listStores.filter((store) =>
        haveAccess(
          store.id,
          userReducer.account ? userReducer.account.account_stores : []
        )
      );
    }
    return newData;
  }, [listStores, userReducer.account]);

  return (
    <div>
      <Form
        size="middle"
        initialValues={{
          store: "",
          source: "",
        }}
        layout="inline"
      >
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            <Card
              className="card-block"
              title={
                <div className="d-flex">
                  <img src={peopleIcon} alt="" /> Khách hàng
                </div>
              }
              extra={
                <div className="d-flex align-items-center form-group-with-search">
                  <label htmlFor="" className="required-label">
                    Nguồn
                  </label>
                  {/* <Input.Search
                    placeholder="Chọn nguồn đơn hàng"
                    enterButton={
                      <Button type="text">
                        <img src={plusBlueIcon} alt="" />
                      </Button>
                    }
                    suffix={<img src={arrowDownIcon} alt="down" />}
                    onSearch={() => console.log(1)}
                  /> */}

                  <Form.Item name="source">
                    <Select
                      className="select-with-search"
                      showSearch
                      style={{ width: "200px" }}
                      placeholder=""
                    >
                      <Select.Option value="">
                        Chọn nguồn đơn hàng
                      </Select.Option>
                      {listSource.map((item, index) => (
                        <Select.Option
                          style={{ width: "100%" }}
                          key={index}
                          value={item.id}
                        >
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              }
            >
              <div className="form-group form-group-with-search form-search-customer">
                <label htmlFor="" className="">
                  Tên khách hàng
                </label>
                <div>
                  <AutoComplete>
                    <Input.Search
                      placeholder="Tìm hoặc thêm khách hàng"
                      enterButton={
                        <Button type="text">
                          <img src={plusBlueIcon} alt="" />
                        </Button>
                      }
                      prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                      onSearch={() => console.log(1)}
                    />
                  </AutoComplete>
                </div>
              </div>

              <Row
                align="middle"
                justify="space-between"
                className="row-customer-detail"
              >
                <Row align="middle" className="customer-detail-name">
                  <Space>
                    <span className="cdn-avatar">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {" "}
                        <circle
                          opacity="0.2"
                          cx="16"
                          cy="16"
                          r="16"
                          fill="#6966FF"
                        />{" "}
                        <path
                          d="M12.853 22L13.8132 19.1307H18.1882L19.1541 22H21.4041L17.3018 10.3636H14.6996L10.603 22H12.853ZM14.3814 17.4375L15.9553 12.75H16.0462L17.62 17.4375H14.3814Z"
                          fill="#6C449F"
                        />{" "}
                      </svg>
                    </span>
                    <span>Đỗ Nguyệt Anh</span>
                    <span className="cdn-level">VIP D</span>
                  </Space>
                </Row>

                <Space className="customer-detail-phone">
                  <span className="customer-detail-icon">
                    <img src={callIcon} alt="" />
                  </span>
                  <span className="customer-detail-text">0986868686</span>
                </Space>

                <Space className="customer-detail-point">
                  <span className="customer-detail-icon">
                    <img src={pointIcon} alt="" />
                  </span>
                  <span className="customer-detail-text">
                    Tổng điểm{" "}
                    <Typography.Text type="success" strong>
                      1230
                    </Typography.Text>
                  </span>
                </Space>

                <Space className="customer-detail-birthday">
                  <span className="customer-detail-icon">
                    <img src={bithdayIcon} alt="" />
                  </span>
                  <span className="customer-detail-text">25/04/1994</span>
                </Space>

                <Space className="customer-detail-action">
                  <Button
                    type="text"
                    className="p-0"
                    onClick={showCustomerModal}
                  >
                    <img src={editBlueIcon} alt="" />
                  </Button>
                  <Button type="text" className="p-0">
                    <img src={deleteRedIcon} alt="" />
                  </Button>
                </Space>
              </Row>

              <Divider />

              <div className="customer-info">
                <Row gutter={24}>
                  <Col
                    xs={24}
                    lg={12}
                    className="font-weight-500 customer-info-left"
                  >
                    <div>Địa chỉ giao hàng</div>
                    <Row className="row-info customer-row-info">
                      <img src={peopleIcon} alt="" style={{ width: 19 }} />{" "}
                      <span style={{ marginLeft: 9 }}>Na</span>
                    </Row>
                    <Row className="row-info customer-row-info">
                      <img src={callIcon} alt="" /> <span>0986868686</span>
                    </Row>
                    <Row className="row-info customer-row-info">
                      <img src={locationIcon} alt="" />{" "}
                      <span>
                        YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                      </span>
                    </Row>
                    <Row>
                      <Popover
                        placement="bottomLeft"
                        title={
                          <Row
                            justify="space-between"
                            align="middle"
                            className="change-shipping-address-title"
                          >
                            <div style={{ color: "#4F687D" }}>
                              Thay đổi địa chỉ
                            </div>
                            <Button type="link" onClick={showAddressModal}>
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          <div className="change-shipping-address-content">
                            <div className="shipping-address-row">
                              <div className="shipping-address-name">
                                Địa chỉ 1{" "}
                                <Button
                                  type="text"
                                  onClick={showAddressModal}
                                  className="p-0"
                                >
                                  <img src={editBlueIcon} alt="" />
                                </Button>
                              </div>
                              <div className="shipping-customer-name">
                                Nguyệt Anh String
                              </div>
                              <div className="shipping-customer-mobile">
                                0986868686
                              </div>
                              <div className="shipping-customer-address">
                                YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                              </div>
                            </div>

                            <div className="shipping-address-row">
                              <div className="shipping-address-name">
                                Địa chỉ 2{" "}
                                <Button
                                  type="text"
                                  onClick={showAddressModal}
                                  className="p-0"
                                >
                                  <img src={editBlueIcon} alt="" />
                                </Button>
                              </div>
                              <div className="shipping-customer-name">
                                Nguyệt Anh String
                              </div>
                              <div className="shipping-customer-mobile">
                                0986868686
                              </div>
                              <div className="shipping-customer-address">
                                YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                              </div>
                            </div>
                          </div>
                        }
                        className="change-shipping-address"
                      >
                        <Button type="link" className="p-0 m-0">
                          Thay đổi địa chỉ giao hàng
                        </Button>
                      </Popover>
                    </Row>
                  </Col>
                  <Col xs={24} lg={12} className="font-weight-500">
                    <div className="form-group form-group-with-search">
                      <div>
                        <label htmlFor="" className="">
                          Ghi chú của khách hàng
                        </label>
                      </div>
                      <Input.TextArea placeholder="Điền ghi chú" rows={4} />
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div className="send-order-box">
                  <Row style={{ marginBottom: 15 }}>
                    <Checkbox
                      className="checkbox-style"
                      onChange={showBillingAddress}
                    >
                      Gửi hoá đơn
                    </Checkbox>
                  </Row>
                  <Row gutter={24} hidden={isVisibleBilling}>
                    <Col
                      xs={24}
                      lg={12}
                      className="font-weight-500 customer-info-left"
                    >
                      <div>Địa chỉ gửi hoá đơn</div>
                      <Row className="row-info customer-row-info">
                        <img src={peopleIcon} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>Na</span>
                      </Row>
                      <Row className="row-info customer-row-info">
                        <img src={callIcon} alt="" /> <span>0986868686</span>
                      </Row>
                      <Row className="row-info customer-row-info">
                        <img src={locationIcon} alt="" />{" "}
                        <span>
                          YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                        </span>
                      </Row>
                      <Row>
                        <Button type="link" className="p-0 m-0">
                          Thay đổi địa chỉ gửi hoá đơn
                        </Button>
                      </Row>
                    </Col>
                    <Col xs={24} lg={12} className="font-weight-500">
                      <div className="form-group form-group-with-search">
                        <div>
                          <label htmlFor="" className="">
                            Email hoá đơn đến
                          </label>
                        </div>
                        <Input placeholder="Nhập email hoá đơn đến" />
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
            {/*--- end customer ---*/}

            <Card
              className="card-block sale-online-product"
              title={
                <div className="d-flex">
                  <img src={productIcon} alt="" /> Sản phẩm
                </div>
              }
              extra={
                <Row>
                  <Space>
                    <Space>
                      <Checkbox
                        className="checkbox-style"
                        style={{ fontSize: 14 }}
                        onChange={() => console.log(1)}
                      >
                        Tách dòng
                      </Checkbox>
                    </Space>
                    <Space>
                      <label htmlFor="">Chính sách giá</label>
                      <Select defaultValue="1" style={{ width: 130 }}>
                        <Select.Option value="1">Giá bán lẻ</Select.Option>
                        <Select.Option value="2">Giá bán buôn</Select.Option>
                      </Select>
                    </Space>
                    <Button type="link" style={{ paddingRight: 0 }}>
                      <Space>
                        <img src={storeBluecon} alt="" />
                        Xem tồn
                        <ArrowRightOutlined />
                      </Space>
                    </Button>
                  </Space>
                </Row>
              }
            >
              <Row gutter={24}>
                <Col xs={24} lg={8}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">
                      Cửa hàng
                    </label>
                    <Form.Item name="store">
                      <Select
                        className="select-with-search"
                        showSearch
                        style={{ width: "100%" }}
                        placeholder=""
                      >
                        <Select.Option value="">Chọn cửa hàng</Select.Option>
                        {dataCanAccess.map((item, index) => (
                          <Select.Option key={index} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </Col>
                <Col xs={24} lg={16}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">
                      Sản phẩm
                    </label>
                    <div>
                      <AutoComplete>
                        <Input
                          placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                          prefix={
                            <SearchOutlined style={{ color: "#ABB4BD" }} />
                          }
                        />
                      </AutoComplete>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="sale-product-box">
                <Table
                  locale={{
                    emptyText: "Không có sản phẩm",
                  }}
                  rowKey={(record) => record.uid}
                  columns={columns}
                  // dataSource={OrderItemModel}
                  className="sale-product-box-table w-100"
                  tableLayout="auto"
                  pagination={false}
                />
              </Row>

              <Row className="sale-product-box-payment" gutter={24}>
                <Col xs={24} lg={12}>
                  <div className="payment-row">
                    <Checkbox
                      className="checkbox-style"
                      onChange={() => console.log(1)}
                    >
                      Bỏ chiết khấu tự động
                    </Checkbox>
                  </div>
                  <div className="payment-row">
                    <Checkbox
                      className="checkbox-style"
                      onChange={() => console.log(1)}
                    >
                      Không tính thuế VAT
                    </Checkbox>
                  </div>
                  <div className="payment-row">
                    <Checkbox
                      className="checkbox-style"
                      onChange={() => console.log(1)}
                    >
                      Bỏ tích điểm tự động
                    </Checkbox>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <Row className="payment-row" justify="space-between">
                    <div className="font-weight-500">Tổng tiền</div>
                    <div className="font-weight-500 payment-row-money">
                      690.900
                    </div>
                  </Row>

                  <Row
                    className="payment-row"
                    justify="space-between"
                    align="middle"
                  >
                    <Space align="center">
                      <Typography.Link className="font-weight-500">
                        Chiết khấu
                      </Typography.Link>
                      <div className="badge-style badge-danger">
                        10%{" "}
                        <Button type="text" className="p-0">
                          x
                        </Button>
                      </div>
                    </Space>
                    <div className="font-weight-500 ">69.090</div>
                  </Row>

                  <Row
                    className="payment-row"
                    justify="space-between"
                    align="middle"
                  >
                    <Space align="center">
                      <Typography.Link className="font-weight-500">
                        Mã giảm giá
                      </Typography.Link>
                      <div className="badge-style badge-primary">
                        SN50{" "}
                        <Button type="text" className="p-0">
                          x
                        </Button>
                      </div>
                    </Space>
                    <div className="font-weight-500 ">41.810</div>
                  </Row>

                  <Row className="payment-row" justify="space-between">
                    <div className="font-weight-500">Phí ship báo khách</div>
                    <div className="font-weight-500 payment-row-money">
                      20.000
                    </div>
                  </Row>

                  <Row className="payment-row" justify="space-between">
                    <div className="font-weight-500">Khách cần trả</div>
                    <div className="font-weight-500 payment-row-money">
                      <Typography.Text
                        type="success"
                        className="font-weight-500"
                      >
                        600.000
                      </Typography.Text>
                    </div>
                  </Row>
                </Col>
              </Row>
            </Card>

            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={truckIcon} alt="" /> Đóng gói và giao hàng
                </div>
              }
            >
              <Row gutter={24} className="">
                <Col xs={24} lg={12}>
                  <div>
                    <label htmlFor="" className="required-label">
                      <i>Lựa chọn 1 trong hình thức giao hàng</i>
                    </label>
                  </div>
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
                    <label htmlFor="" className="">
                      Hẹn giao
                    </label>
                    <Input
                      placeholder="Chọn ngày giao"
                      suffix={<img src={arrowDownIcon} alt="down" />}
                    />
                  </div>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">
                      Yêu cầu
                    </label>
                    <Input
                      placeholder="Cho phép xem hàng và thử hàng"
                      suffix={<img src={arrowDownIcon} alt="down" />}
                    />
                  </div>
                </Col>
              </Row>

              <Divider />

              <div>
                {/*--- đối tác ----*/}
                <Row className="ship-box" hidden={false}>
                  <div className="form-group form-group-with-search">
                    <label htmlFor="" className="">
                      Phí ship báo khách
                    </label>
                    <InputNumber
                      placeholder=""
                      className="text-right hide-handler-wrap w-100"
                    />
                  </div>
                  <div className="table-ship w-100">
                    <Descriptions title="" bordered layout="vertical">
                      <Descriptions.Item label="Hãng vận chuyển">
                        <div>
                          <img src={dhlIcon} alt="" />
                        </div>
                        <Divider />
                        <div>
                          <img src={ghtkIcon} alt="" />
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="Dịch vụ chuyển phát">
                        <div>
                          <Space>
                            <Radio>Chuyển phát nhanh PDE</Radio>
                          </Space>
                        </div>
                        <Divider />
                        <div>
                          <Row>
                            <Space>
                              <Radio>Đường bộ</Radio>
                            </Space>
                          </Row>
                          <Row>
                            <Space>
                              <Radio>Đường bay</Radio>
                            </Space>
                          </Row>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Cước phí">
                        <div>
                          <Typography.Text type="success">
                            18000
                          </Typography.Text>
                        </div>
                        <Divider />
                        <div>
                          <Row>
                            <Typography.Text type="secondary">
                              30000
                            </Typography.Text>
                          </Row>
                          <Row>
                            <Typography.Text type="secondary">
                              50000
                            </Typography.Text>
                          </Row>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Row>

                {/*--- Tự giao hàng ----*/}
                <Row gutter={24} className="ship-cod" hidden={true}>
                  <Col xs={24} lg={12}>
                    <div className="form-group form-group-with-search form-search-customer">
                      <label htmlFor="" className="">
                        Đối tác giao hàng
                      </label>
                      <div>
                        <AutoComplete>
                          <Input.Search
                            placeholder="Chọn đối tác giao hàng"
                            enterButton={
                              <Button type="text">
                                <img src={plusBlueIcon} alt="" />
                              </Button>
                            }
                            prefix={
                              <SearchOutlined style={{ color: "#ABB4BD" }} />
                            }
                            onSearch={() => console.log(1)}
                            suffix={<img src={arrowDownIcon} alt="down" />}
                          />
                        </AutoComplete>
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
                          placeholder="Nhập số tiền"
                          className="text-right hide-handler-wrap w-100"
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
                          placeholder="Nhập số tiền"
                          className="text-right hide-handler-wrap w-100"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                {/*--- Nhận tại cửa hàng ----*/}
                <div className="receive-at-store" hidden={true}>
                  <Row>Nhận tại cửa hàng</Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={storeBluecon} alt="" />
                      </div>
                      <div className="row-info-title">Cửa hàng</div>
                      <div className="row-info-content">
                        <Typography.Link>YODY Kho Online</Typography.Link>
                      </div>
                    </Space>
                  </Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={callIcon} alt="" />
                      </div>
                      <div className="row-info-title">Điện thoại</div>
                      <div className="row-info-content">0968563666</div>
                    </Space>
                  </Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={locationIcon} alt="" />
                      </div>
                      <div className="row-info-title">Địa chỉ</div>
                      <div className="row-info-content">
                        Khu Tiểu Thủ CN Gia Xuyên - Phố ĐInh Lễ - Xã Gia Xuyên -
                        TP Hải Dương
                      </div>
                    </Space>
                  </Row>
                </div>

                {/*--- Giao hàng sau ----*/}
                <Row className="ship-later-box" hidden={true}>
                  <div className="form-group m-0">
                    <label htmlFor="">
                      <i>
                        Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn
                        hàng.
                      </i>
                    </label>
                  </div>
                </Row>
              </div>
            </Card>

            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={walletIcon} alt="" /> Thanh toán
                </div>
              }
            >
              <div className="payment-method-radio-list">
                <label htmlFor="" className="required-label">
                  <i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>
                </label>
                <div style={{ marginTop: 15 }}>
                  <Radio.Group name="radiogroup" defaultValue={1}>
                    <Radio value={1}>COD</Radio>
                    <Radio value={2}>Thanh toán trước</Radio>
                    <Radio value={3}>Thanh toán sau</Radio>
                  </Radio.Group>
                </div>
              </div>

              <Divider />

              <div className="payment-method-content">
                <Row gutter={24} className="payment-cod-box" hidden={false}>
                  <Col xs={24} lg={12}>
                    <div className="form-group form-group-with-search">
                      <label htmlFor="" className="">
                        Tiền thu hộ
                      </label>
                      <div>
                        <InputNumber
                          min={0}
                          placeholder="Nhập số tiền"
                          className="text-right hide-handler-wrap w-100"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row gutter={24} hidden={true}>
                  <Col xs={24} lg={12}>
                    <div className="form-group form-group-with-search">
                      <label htmlFor="" className="">
                        Hình thức thanh toán
                      </label>
                      {/*<Input placeholder="Chuyển Khoản"*/}
                      {/*       suffix={<img src={arrowDownIcon} alt="down" />}*/}
                      {/*/>*/}

                      <Select
                        className="select-with-search"
                        showSearch
                        style={{ width: "100%" }}
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
                      <label htmlFor="" className="">
                        Số tiền
                      </label>
                      <Input placeholder="Chuyển Khoản" />
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="form-group form-group-with-search">
                      <label htmlFor="" className="">
                        Ngày chuyển khoản
                      </label>
                      <Input
                        placeholder="Ngày chuyển khoản"
                        suffix={<img src={arrowDownIcon} alt="down" />}
                      />
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="form-group form-group-with-search">
                      <label htmlFor="" className="">
                        Tham chiếu
                      </label>
                      <Input placeholder="Nhập tham chiếu" />
                    </div>
                  </Col>
                  <Col span={24}>
                    <Button type="link" className="p-0">
                      Thêm hình thức thanh toán
                    </Button>
                  </Col>
                </Row>

                <Row className="payment-later-box" hidden={true}>
                  <div className="form-group m-0">
                    <label htmlFor="">
                      <i>Bạn có thể xử lý thanh toán sau khi tạo đơn hàng.</i>
                    </label>
                  </div>
                </Row>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={7}>
            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin đơn hàng
                </div>
              }
            >
              <div className="form-group form-group-with-search">
                <label htmlFor="" className="required-label">
                  Nhân viên bán hàng
                </label>
                <Input
                  placeholder="Tìm tên/ mã nhân viên"
                  suffix={<img src={arrowDownIcon} alt="down" />}
                />
              </div>
              <div className="form-group form-group-with-search">
                <div>
                  <label htmlFor="" className="">
                    Tham chiếu
                  </label>
                  <Tooltip
                    title="Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Điền tham chiếu"
                  suffix={<img src={arrowDownIcon} alt="down" />}
                />
              </div>
              <div className="form-group form-group-with-search mb-0">
                <div>
                  <label htmlFor="" className="">
                    Đường dẫn
                  </label>
                  <Tooltip
                    title="Thêm đường dẫn đơn hàng gốc trên kênh bán hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Điền đường dẫn"
                  suffix={<img src={arrowDownIcon} alt="down" />}
                />
              </div>
            </Card>

            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin bổ sung
                </div>
              }
            >
              <div className="form-group form-group-with-search">
                <div>
                  <label htmlFor="" className="">
                    Ghi chú
                  </label>
                  <Tooltip
                    title="Thêm thông tin ghi chú chăm sóc khách hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input.TextArea placeholder="Điền ghi chú" />
              </div>
              <div className="form-group form-group-with-search mb-0">
                <div>
                  <label htmlFor="" className="">
                    Tag
                  </label>
                  <Tooltip
                    title="Thêm từ khóa để tiện lọc đơn hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input placeholder="Thêm tag" />
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="footer-row-btn" justify="end">
          <Button type="default" className="btn-style btn-cancel">
            Hủy
          </Button>
          <Button type="default" className="btn-style btn-save">
            Lưu
          </Button>
        </Row>

        <AddAddressModal
          visible={isVisibleAddress}
          onCancel={onCancleConfirmAddress}
          onOk={onOkConfirmAddress}
        />
        <EditCustomerModal
          visible={isVisibleCustomer}
          onCancel={onCancleConfirmCustomer}
          onOk={onOkConfirmCustomer}
        />
      </Form>
    </div>
  );
};

export default CreateBill;
