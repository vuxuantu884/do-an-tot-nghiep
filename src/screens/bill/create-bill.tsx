import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Tooltip,
  Typography,
  InputNumber,
  Menu,
  Dropdown,
  Select,
} from "antd";
import documentIcon from "../../assets/img/document.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import warningCircleIcon from "assets/img/warning-circle.svg";
import ProductCard from "../../component/OrderOnline/productCard";
import CustomerCard from "../../component/OrderOnline/customerCard";
import PaymentCard from "../../component/OrderOnline/paymentCard";
import ShipmentCard from "../../component/OrderOnline/shipmentCard";
import { useState, useCallback, useLayoutEffect, useMemo } from "react";
import DiscountGroup from "../../component/OrderOnline/discountGroup";
import { useSelector, useDispatch } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreModel } from "model/other/StoreModel";
import { getListStoreRequest } from "domain/actions/store.action";
import {
  formatCurrency,
  replaceFormat,
  haveAccess,
} from "../../utils/AppUtils";

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

  const [selectedShipMethod, setSelectedShipMethod] = useState(1);
  const changeShipMethod = (value: number) => {
    setSelectedShipMethod(value);
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);
  const changePaymentMethod = (value: number) => {
    setSelectedPaymentMethod(value);
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
              <img alt="" />
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
      <div className="text-center">
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
    className: "yody-table-discount text-right",
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
    width: 85,
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

  const dispatch = useDispatch();

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          {/*--- customer ---*/}
          <CustomerCard />
          {/*--- end customer ---*/}

          {/*--- product ---*/}
          <ProductCard />
          {/*--- end product ---*/}

          {/*--- shipment ---*/}
          <ShipmentCard />
          {/*--- end shipment ---*/}

          {/*--- payment ---*/}
          <PaymentCard />
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
    </div>
  );
};

export default CreateBill;
