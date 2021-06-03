import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Tooltip,
  Select,
} from "antd";
import documentIcon from "../../assets/img/document.svg";
import warningCircleIcon from "assets/img/warning-circle.svg";
import ProductCard from "../../component/OrderOnline/productCard";
import CustomerCard from "../../component/OrderOnline/customerCard";
import PaymentCard from "../../component/OrderOnline/paymentCard";
import ShipmentCard from "../../component/OrderOnline/shipmentCard";
import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { StoreModel } from "model/other/StoreModel";
import {
  validateStoreAction,
} from "domain/actions/core/store.action";
import { OrderItemModel } from "model/other/Order/OrderItemModel";
import { OrderRequest } from "model/request/OrderRequest";
import { OrderLineItemRequest } from "model/request/OrderLineItemRequest";
import { OrderItemDiscountRequest } from "model/request/OrderItemDiscountRequest";

import { OrderItemDiscountModel } from "model/other/Order/OrderItemDiscountModel";

const CreateBill = () => {

  const [items, setItems] = useState<Array<OrderItemModel>>([])
  const [storeId, setStoreId] = useState<number|null>(null)
  const [priceType, setPriceType] = useState<string>("retail_price")
  const [discountRate, setDiscountRate] = useState<number>(0)
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)


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
  const [isVerify, setVerify] = useState(false);


  const onStoreSelect = (storeId: number) => {
      setStoreId(storeId);
    }

  const onPriceTypeSelect = (priceType: string) => {
      setPriceType(priceType)
    }


  const onChangeInfo = useCallback(
    (_items: Array<OrderItemModel>, amount:number, discount_rate: number, discount_value: number) => {
      setItems(items)
      setDiscountRate(discount_rate)
      setDiscountValue(discount_value)
      setAmount(amount)
    },
    []
  );

  const createOrderRequest = () => {
    let orderLineItemsRequest: Array<OrderLineItemRequest> = []
    items.forEach((item,index)=>{
      orderLineItemsRequest.push(createOrderLineItemRequest(item,"normal",index))
      item.gifts.forEach(gif => {
        orderLineItemsRequest.push(createOrderLineItemRequest(gif,"gif",index))
      })
    })
    // const request:OrderRequest = {

    // }
  }

  const createOrderLineItemRequest = (model:OrderItemModel, type:string, position:number) => {
    let orderItemDiscountRequest:OrderItemDiscountRequest = createOrderItemDiscountRequest(model.discount_items[0])
    const request:OrderLineItemRequest = {
      sku: model.sku,
      variant_id: model.variant_id,
      variant: model.variant,
      product_id: model.product_id,
      product: model.product,
      variant_barcode: model.variant_barcode,
      product_type: model.product_type,
      quantity: model.quantity,
      price: model.price,
      amount: model.amount,
      note: model.note,
      type: type,
      variant_image: model.variant_image,
      unit: model.unit,
      warranty: model.warranty,
      tax_rate: model.tax_rate,
      tax_include: model.tax_include,
      line_amount_after_line_discount: model.line_amount_after_line_discount,
      discount_items: [orderItemDiscountRequest],
      discount_rate: model.discount_items[0].rate,
      discount_value: model.discount_items[0].value,
      discount_amount: model.discount_items[0].amount,
      position: position
    }
    return request
  }

  const createOrderItemDiscountRequest = (model:OrderItemDiscountModel) => {
    const request:OrderItemDiscountRequest = {
      rate: model.rate,
      value: model.value,
      amount: model.amount,
      promotion_id: model.promotion_id,
      reason: model.reason
    }
    return request
  }



  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          {/*--- customer ---*/}
          <CustomerCard />
          {/*--- end customer ---*/}

          {/*--- product ---*/}
          <ProductCard changeInfo={onChangeInfo} selectStore={onStoreSelect} selectPriceType={onPriceTypeSelect} />
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
                style={{ width: "200px" }}
                placeholder=""
                defaultValue=""
              >
                <Select.Option value="">Chọn tên/mã nhân viên</Select.Option>
                {/* {store?.accounts.map((item, index) => (
                  <Select.Option
                    style={{ width: "100%" }}
                    key={index}
                    value={item.id}
                  >
                    {item.full_name}
                  </Select.Option>
                ))} */}
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
    </div>
  );
};

export default CreateBill;
