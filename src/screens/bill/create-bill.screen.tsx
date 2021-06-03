import { Button, Card, Input, Row, Col, Tooltip, Select, Form } from "antd";
import documentIcon from "../../assets/img/document.svg";
import warningCircleIcon from "assets/img/warning-circle.svg";
import ProductCard from "../../component/OrderOnline/productCard";
import CustomerCard from "../../component/OrderOnline/customerCard";
import PaymentCard from "../../component/OrderOnline/paymentCard";
import ShipmentCard from "../../component/OrderOnline/shipmentCard";
import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { StoreModel } from "model/other/StoreModel";
import { validateStoreAction } from "domain/actions/core/store.action";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { PageResponse } from "model/response/base-metadata.response";
import AccountAction from "domain/actions/account/account.action";

const CreateBill = () => {
  const dispatch = useDispatch();
  //State
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVerify, setVerify] = useState(false);
  const [selectedShipMethod, setSelectedShipMethod] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);
  const [store, setStore] = useState<StoreModel | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountDetailResponse>>([]);

  //Address modal
  const showAddressModal = () => {
    setVisibleAddress(true);
  };
  const onCancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);
  const onOkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  //Customer modal
  const showCustomerModal = () => {
    setVisibleCustomer(true);
  };
  const onCancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);
  const onOkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  //Bill Addresss
  const showBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  const changeShipMethod = (value: number) => {
    setSelectedShipMethod(value);
  };
  const changePaymentMethod = (value: number) => {
    setSelectedPaymentMethod(value);
  };

  const onStoreSelect = useCallback(
    (item: number) => {
      dispatch(validateStoreAction(item, setStore));
    },
    [dispatch]
  );

  //Account dropdown
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountDetailResponse>) => {
      setAccounts(data.items);
    },
    []
  );
  useEffect(() => {
    dispatch(AccountAction.SearchAccount({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  return (
    <div>
      <Form>
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            {/*--- customer ---*/}
            <CustomerCard />
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <ProductCard select={onStoreSelect} />
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
                <Select
                  className="select-with-search"
                  showSearch
                  placeholder="Chọn nhân viên"
                >
                  {accounts.map((item, index) => (
                    <Select.Option
                      style={{ width: "100%" }}
                      key={index}
                      value={item.id}
                    >
                      {item.full_name}
                    </Select.Option>
                  ))}
                </Select>
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
                <Input placeholder="Điền tham chiếu" />
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
                <Input placeholder="Điền đường dẫn" />
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
      </Form>
    </div>
  );
};

export default CreateBill;
