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
import { VariantModel } from "model/other/ProductModel";

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
