//#region Import
import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Select,
  Form,
  Space,
  Typography,
  Popover,
  Divider,
  Checkbox,
  Tooltip,
  Table,
} from "antd";
import documentIcon from "../../assets/img/document.svg";
import PaymentCard from "./payment-card";
import ShipmentCard from "./shipment-card";
import {
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useDispatch } from "react-redux";
import { OrderPaymentRequest } from "model/request/order.request";
import { AccountResponse } from "model/account/account.model";
import { useHistory } from "react-router";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderItemModel } from "model/other/Order/order-model";
import { OrderDetailAction } from "domain/actions/order/order.action";
import { showSuccess } from "utils/ToastUtils";
import { InfoCircleOutlined } from "@ant-design/icons";
import "assets/css/v2/_sale-order.scss";
import { Moment } from "moment";
import AddAddressModal from "./modal/addAddressModal";
import EditCustomerModal from "./modal/editCustomerModal";
import peopleIcon2 from "assets/img/people.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import pointIcon from "assets/img/point.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import deleteIcon from "assets/icon/delete.svg";
import giftIcon from "assets/icon/gift.svg";
import { EditOutlined } from "@ant-design/icons";
import productIcon from "../../assets/img/cube.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import { useParams } from "react-router-dom";
import {
  OrderLineItemResponse,
  OrderResponse,
} from "model/response/order/order.response";
//#endregion

type OrderParam = {
  id: string;
};

const OrderDetail = () => {
  const { id } = useParams<OrderParam>();
  let OrderId = parseInt(id);
  //#region state
  const dispatch = useDispatch();
  const history = useHistory();
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [assignCode, setAssignCode] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [shipmentType, setShipmentType] = useState<number>(4);
  const [paymentType, setPaymentType] = useState<number>(3);
  const [isVisibleAssignCode, setVisibleAssignCode] = useState<boolean>(false);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [ShipFeeCustomer, setShipFeeCustomer] = useState<number>(0);
  const [ShipDeliveryFee, setShipDeliveryFee] = useState<number>(0);
  const [ShipDeliveryPartner, setShipDeliveryPartner] = useState<number | null>(
    null
  );
  const [RequirementShip, setRequirementShip] = useState<string>("");
  const [CODMoney, setCODMoney] = useState<number>(0);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);

  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [amount, setAmount] = useState<number>(0);
  //#endregion

  const isFirstLoad = useRef(true);

  const handleVisibleBillingAddressChange = (value: boolean) => {
    setVisibleBillingAddress(value);
  };

  const onShipmentSelect = (shipmentType: number) => {
    setShipmentType(shipmentType);
  };

  const ChangeShipFeeCustomer = (item: number) => {
    setShipFeeCustomer(item);
  };

  const ChangeShipDeliveryFee = (item: number) => {
    setShipDeliveryFee(item);
  };

  const ChangeShipDeliveryPartner = (item: number) => {
    setShipDeliveryPartner(item);
  };
  const ChangeRequirementShip = (item: string) => {
    setRequirementShip(item);
  };

  const onPaymentSelect = (paymentType: number) => {
    setPaymentType(paymentType);
  };

  const CodMoneyChange = (value: number) => {
    setCODMoney(value);
  };

  const CancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const CancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const onChangeAssignCode = (value: string) => {
    setAssignCode(value);
    setVisibleAssignCode(false);
  };

  const onChangeReference = (value: string) => {
    setReference(value);
  };

  const onChangeUrl = (value: string) => {
    setUrl(value);
  };

  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };

  const onChangeTag = (value: []) => {
    let strTag = "";
    value.forEach((element) => {
      strTag = strTag + element + ",";
    });

    setTag(strTag);
  };

  const onCreateSuccess = useCallback(() => {
    showSuccess("Thêm đơn hàng thành công");
    history.push("/list-orders");
  }, [history]);

  //#region Modal
  const ShowAddressModal = () => {
    setVisibleAddress(true);
    setVisibleShippingAddress(false);
    setVisibleBillingAddress(false);
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!Number.isNaN(OrderId)) {
        dispatch(OrderDetailAction(OrderId, setOrderDetail));
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, OrderId]);

  const total = useMemo(() => {
    return orderAmount;
  }, [orderAmount]);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);

  const onDeleteItem = (index: number) => {
    if (OrderDetail != null) {
      let _items = OrderDetail;
      let _amount =
        amount - _items.items[index].line_amount_after_line_discount;
      setAmount(_amount);
      _items.items.splice(index, 1);
      setOrderDetail(_items);
    }
  };

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  const ProductColumn = {
    title: "Sản phẩm",
    width: 245,
    className: "yody-pos-name",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <Button
              type="text"
              className="p-0 yody-pos-delete-free-form"
              onClick={() => onDeleteItem(index)}
            >
              <img src={deleteIcon} alt="" />
            </Button>
            <div style={{ width: "calc(100% - 32px)", marginLeft: "15px" }}>
              <div className="yody-pos-sku">
                <Typography.Link>{l.sku}</Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          {l.gifts?.map((a, index1) => (
            <div key={index1} className="yody-pos-addition yody-pos-gift">
              <div>
                <img src={giftIcon} alt="" /> {a.variant}{" "}
                <span>({a.quantity})</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  };

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: 125,
    render: (l: OrderItemModel, item: any, index: number) => {
      return <div className="yody-pos-qtt">35</div>;
    },
  };

  const PriceColumnt = {
    title: "Đơn giá",
    className: "yody-pos-price text-right",
    //width: 100,
    render: (l: OrderItemModel, item: any, index: number) => {
      return <div className="yody-pos-price">399.000</div>;
    },
  };

  const DiscountColumnt = {
    title: "Chiết khấu",
    align: "center",
    width: 165,
    className: "yody-table-discount text-right",
    render: (l: OrderItemModel, item: any, index: number) => {
      return <div className="site-input-group-wrapper">10%</div>;
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    className: "yody-table-total-money text-right",
    // width: 100,
    render: (l: OrderItemModel, item: any, index: number) => {
      return <div>1000000</div>;
    },
  };

  const columns = [
    ProductColumn,
    AmountColumnt,
    PriceColumnt,
    DiscountColumnt,
    TotalPriceColumn,
  ];

  return (
    <div>
      <Form layout="vertical">
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            {/*--- customer ---*/}
            <Card
              className="card-block card-block-customer"
              title={
                <div className="d-flex">
                  <img src={peopleIcon2} alt="" /> Khách hàng
                </div>
              }
              extra={
                <div className="d-flex align-items-center form-group-with-search">
                  <Form.Item>
                    <label style={{ marginRight: "10px" }}>
                      Nguồn:{" "}
                      <span style={{ color: "red" }}>
                        {OrderDetail?.source}
                      </span>
                    </label>
                  </Form.Item>
                </div>
              }
            >
              <div>
                <Row
                  align="middle"
                  justify="space-between"
                  className="row-customer-detail padding-custom"
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
                      <span style={{ fontWeight: 500, fontSize: "14px" }}>
                        {OrderDetail?.customer}
                      </span>
                      <span className="cdn-level">Level 1</span>
                    </Space>
                  </Row>

                  <Space className="customer-detail-phone">
                    <span className="customer-detail-icon">
                      <img src={callIcon} alt="" />
                    </span>
                    <span className="customer-detail-text">
                      {OrderDetail?.customer_phone_number}
                    </span>
                  </Space>

                  <Space className="customer-detail-point">
                    <span className="customer-detail-icon">
                      <img src={pointIcon} alt="" />
                    </span>
                    <span className="customer-detail-text">
                      Tổng điểm{" "}
                      <Typography.Text
                        type="success"
                        style={{ color: "#0080FF" }}
                        strong
                      >
                        0
                      </Typography.Text>
                    </span>
                  </Space>

                  <Space className="customer-detail-birthday">
                    <span className="customer-detail-icon">
                      <img src={bithdayIcon} alt="" />
                    </span>
                    <span className="customer-detail-text">11/11/2020</span>
                  </Space>
                </Row>
                <Divider />
                <div className="customer-info padding-custom">
                  <Row gutter={24}>
                    <Col
                      xs={24}
                      lg={12}
                      className="font-weight-500 customer-info-left"
                    >
                      <div className="title-address">Địa chỉ giao hàng</div>
                      <Row className="customer-row-info">
                        <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>Ha Noi</span>
                      </Row>
                      <Row className="customer-row-info">
                        <img src={callIcon} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>0987654321</span>
                      </Row>
                      <Row className="customer-row-info">
                        <img src={locationIcon} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>Cau Giay-Ha Noi</span>
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
                              <Button type="link" onClick={ShowAddressModal}>
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
                                    onClick={ShowAddressModal}
                                    className="p-0"
                                  >
                                    <img src={editBlueIcon} alt="" />
                                  </Button>
                                </div>
                                <div className="shipping-customer-name">
                                  Do Van A
                                </div>
                                <div className="shipping-customer-mobile">
                                  0987654321
                                </div>
                                <div className="shipping-customer-address">
                                  Ha Noi
                                </div>
                              </div>
                            </div>
                          }
                          trigger="click"
                          visible={visibleShippingAddress}
                          onVisibleChange={handleVisibleBillingAddressChange}
                          className="change-shipping-address"
                        >
                          <Button type="link" className="btn-style">
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
                        onChange={ShowBillingAddress}
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
                        <div className="title-address">Địa chỉ giao hàng</div>
                        <Row className="customer-row-info">
                          <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                          <span style={{ marginLeft: 9 }}>Do Van A</span>
                        </Row>
                        <Row className="customer-row-info">
                          <img src={callIcon} alt="" style={{ width: 19 }} />{" "}
                          <span style={{ marginLeft: 9 }}>0987654321</span>
                        </Row>
                        <Row className="customer-row-info">
                          <img
                            src={locationIcon}
                            alt=""
                            style={{ width: 19 }}
                          />{" "}
                          <span style={{ marginLeft: 9 }}>
                            Cau Giay - Ha Noi
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
                                <Button type="link" onClick={ShowAddressModal}>
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
                                      onClick={ShowAddressModal}
                                      className="p-0"
                                    >
                                      <img src={editBlueIcon} alt="" />
                                    </Button>
                                  </div>
                                  <div className="shipping-customer-name">
                                    Do Van A
                                  </div>
                                  <div className="shipping-customer-mobile">
                                    0987654321
                                  </div>
                                  <div className="shipping-customer-address">
                                    Ha Noi
                                  </div>
                                </div>
                              </div>
                            }
                            trigger="click"
                            visible={visibleBillingAddress}
                            onVisibleChange={handleVisibleBillingAddressChange}
                            className="change-shipping-address"
                          >
                            <Button type="link" className="btn-style">
                              Thay đổi địa chỉ gửi hóa đơn
                            </Button>
                          </Popover>
                        </Row>
                      </Col>
                      <Col xs={24} lg={12} className="font-weight-500">
                        <div className="form-group form-group-with-search">
                          <div>
                            <label htmlFor="" className="">
                              Email hoá đơn đến
                            </label>
                          </div>
                          <Input
                            type="email"
                            placeholder="Nhập email hoá đơn đến"
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>

              <AddAddressModal
                visible={isVisibleAddress}
                onCancel={CancleConfirmAddress}
                onOk={OkConfirmAddress}
              />
              <EditCustomerModal
                visible={isVisibleCustomer}
                onCancel={CancleConfirmCustomer}
                onOk={OkConfirmCustomer}
              />
            </Card>
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <img src={productIcon} alt="" /> Sản phẩm
                </div>
              }
              extra={
                <Row>
                  <Space>
                    <div className="view-inventory-box">
                      <Button type="link" className="p-0">
                        <Space>
                          <img src={storeBluecon} alt="" />
                          Xem tồn
                        </Space>
                      </Button>
                    </div>
                  </Space>
                </Row>
              }
            >
              <div className="padding-20">
                <Row className="sale-product-box">
                  <Table
                    locale={{
                      emptyText: (
                        <Button
                          type="text"
                          className="font-weight-500"
                          style={{
                            color: "#2A2A86",
                            background: "rgba(42,42,134,0.05)",
                            borderRadius: 5,
                            padding: 8,
                            height: "auto",
                            marginTop: 15,
                            marginBottom: 15,
                          }}
                        >
                          Thêm sản phẩm ngay (F3)
                        </Button>
                      ),
                    }}
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={OrderDetail?.items}
                    className="sale-product-box-table w-100"
                    tableLayout="fixed"
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
                        Amount
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
                          {/* {discountRate !== null ? discountRate : 0}%{" "} */}
                          0%
                        </div>
                      </Space>
                      <div className="font-weight-500 ">1000</div>
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
                        <div className="badge-style badge-primary">jfaj</div>
                      </Space>
                      <div className="font-weight-500 ">0</div>
                    </Row>

                    <Row className="payment-row" justify="space-between">
                      <div className="font-weight-500">Phí ship báo khách</div>
                      <div className="font-weight-500 payment-row-money">
                        20,000
                      </div>
                    </Row>

                    <Row className="payment-row" justify="space-between">
                      <div className="font-weight-500">Khách cần trả</div>
                      <div className="font-weight-500 payment-row-money">
                        {/* {formatCurrency(changeMoney)} */}
                        Khách cần trả
                      </div>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
            {/*--- end product ---*/}

            {/*--- shipment ---*/}
            <ShipmentCard
              SelectedShipmentType={onShipmentSelect}
              ShipFeeCustomer={ChangeShipFeeCustomer}
              ShipDeliveryFee={ChangeShipDeliveryFee}
              RequirementShip={ChangeRequirementShip}
              ShipDeliveryPartner={ChangeShipDeliveryPartner}
              shipmentMethod={shipmentType}
              storeId={storeId}
            />
            {/*--- end shipment ---*/}

            {/*--- payment ---*/}
            <PaymentCard
              setSelectedPaymentMethod={onPaymentSelect}
              setCodeMonay={CodMoneyChange}
              setPayments={onPayments}
              paymentMethod={paymentType}
              amount={total}
            />
            {/*--- end payment ---*/}
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
              <div className="padding-20">
                <Form.Item
                  label="Nhân viên bán hàng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhân viên bán hàng",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    placeholder="Chọn nhân viên bán hàng"
                    onChange={onChangeAssignCode}
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
                    {accounts.map((item, index) => (
                      <Select.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.code}
                      >
                        {item.full_name}
                      </Select.Option>
                    ))}
                  </Select>

                  {isVisibleAssignCode === true && (
                    <div>
                      <div
                        className="ant-form-item-explain ant-form-item-explain-error"
                        style={{ padding: "5px" }}
                      >
                        <div role="alert">Vui lòng chọn nhân viên bán hàng</div>
                      </div>
                    </div>
                  )}
                </Form.Item>
                <Form.Item
                  label="Tham chiếu"
                  tooltip={{
                    title:
                      "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input
                    onChange={(e) => onChangeReference(e.target.value)}
                    placeholder="Điền tham chiếu"
                  />
                </Form.Item>
                <Form.Item
                  label="Đường dẫn"
                  style={{ marginBottom: "0px" }}
                  tooltip={{
                    title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input
                    onChange={(e) => onChangeUrl(e.target.value)}
                    placeholder="Điền đường dẫn"
                  />
                </Form.Item>
              </div>
            </Card>

            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin bổ sung
                </div>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label="Nhập ghi chú"
                  tooltip={{
                    title: "Thêm thông tin ghi chú chăm sóc khách hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input.TextArea placeholder="Nhập ghi chú" />
                </Form.Item>

                <Form.Item
                  label="Tags"
                  style={{ marginBottom: "0px" }}
                  tooltip={{
                    title: "Thêm từ khóa để tiện lọc đơn hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags"
                    onChange={onChangeTag}
                    tokenSeparators={[","]}
                  ></Select>
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="margin-top-10" justify="end">
          <Button
            type="default"
            className="btn-style btn-cancel"
            style={{ marginRight: "10px" }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="btn-style btn-save"
            style={{ color: "white" }}
          >
            Lưu
          </Button>
        </Row>
      </Form>
    </div>
  );
};

export default OrderDetail;
