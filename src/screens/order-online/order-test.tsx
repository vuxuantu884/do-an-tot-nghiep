import React, {
  createRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Checkbox,
  Input,
  Space,
  Divider,
  Radio,
  Avatar,
  Tag,
  Popover,
  AutoComplete,
  Typography,
  Menu,
  Dropdown,
  Tooltip,
  InputNumber,
  Table as ANTTable,
} from "antd";
import {
  ArrowRightOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ProfileOutlined,
  SearchOutlined,
  ShopOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { Select } from "component/common/select";
import { Link } from "react-router-dom";
import { Table } from "component/common/table";
import "assets/css/v2/_sale-order.scss";
import { SourceResponse } from "model/response/order/source.response";
import { useDispatch, useSelector } from "react-redux";
import { getListSourceRequest } from "domain/actions/product/source.action";

import peopleIcon2 from "assets/img/people.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import deleteRedIcon from "assets/img/deleteRed.svg";
import pointIcon from "assets/img/point.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import imgdefault from "assets/icon/img-default.svg";
import productIcon from "../../assets/img/cube.svg";
import deleteIcon from "assets/icon/delete.svg";
import giftIcon from "assets/icon/gift.svg";
import arrowDownIcon from "../../assets/img/drow-down.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { RefSelectProps } from "antd/lib/select";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import moment from "moment";
import { StoreResponse } from "model/core/store.model";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  formatSuffixPoint,
  haveAccess,
  replaceFormat,
  replaceFormatString,
} from "utils/AppUtils";
import {
  StoreDetailAction,
  StoreGetListAction,
} from "domain/actions/core/store.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { AppConfig } from "config/AppConfig";
import {
  OrderItemDiscountModel,
  OrderItemModel,
} from "model/other/Order/order-model";

import { BugOutlined, QrcodeOutlined } from "@ant-design/icons";

import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
import DiscountGroup from "./discount-group";
import { PageResponse } from "model/base/base-metadata.response";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { Type } from "../../config/TypeConfig";
import NumberInput from "component/custom/number-input.custom";
import PickDiscountModal from "./modal/PickDiscountModal";
import { showError, showSuccess } from "utils/ToastUtils";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction, ShipperGetListAction } from "domain/actions/account/account.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodCode } from "utils/Constants";

const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
};

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
};

export default function Order() {
  //#region State
  const dispatch = useDispatch();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [resultSearchCustomer, setResultSearchCustomer] = useState<
    Array<CustomerResponse>
  >([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const [keysearchCustomer, setKeySearchCustomer] = useState("");
  const autoCompleteRef = createRef<RefSelectProps>();
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [isVisibleGift, setVisibleGift] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<string>("money");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [changeMoney, setChangeMoney] = useState<number>(0);
  const [counpon, setCounpon] = useState<string>("");
  const [itemGifts, setItemGift] = useState<Array<OrderItemModel>>([]);
  const [keysearchVariant, setKeysearchVariant] = useState("");
  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [paymentMethod, setPaymentMethod] = useState<number>(3);
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>(
    []
  );
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [resultSearchVariant, setResultSearchVariant] = useState<
    PageResponse<VariantResponse>
  >({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  //#endregion

  //#region Customer
  const CustomerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      initQueryCustomer.request = value;
      dispatch(CustomerSearch(initQueryCustomer, setResultSearchCustomer));
    },
    [dispatch]
  );

  const SearchCustomerSelect = useCallback(
    (value, o) => {
      let index: number = -1;
      index = resultSearchCustomer.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        setCustomer(resultSearchCustomer[index]);
        //set Shipping Address
        if (
          resultSearchCustomer[index].shipping_addresses !== undefined &&
          resultSearchCustomer[index].shipping_addresses !== null
        ) {
          resultSearchCustomer[index].shipping_addresses.forEach(
            (item, index2) => {
              if (item.default === true) {
                setShippingAddress(item);
              }
            }
          );
        }

        //set Billing Address
        if (
          resultSearchCustomer[index].billing_addresses !== undefined &&
          resultSearchCustomer[index].billing_addresses !== null
        ) {
          resultSearchCustomer[index].billing_addresses.forEach(
            (item, index2) => {
              if (item.default === true) {
                setBillingAddress(item);
              }
            }
          );
        }
        autoCompleteRef.current?.blur();
        setKeySearchCustomer("");
      }
    },
    [autoCompleteRef, dispatch, resultSearchCustomer, customer]
  );

  //Render result search
  const CustomerRenderSearchResult = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100">
          <img src={imgdefault} alt="anh" placeholder={imgdefault} />
          <div className="rs-info w-100">
            <span className="text">
              {item.full_name} - {item.phone}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomerConvertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearchCustomer.forEach((item: CustomerResponse, index: number) => {
      options.push({
        label: CustomerRenderSearchResult(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [dispatch, resultSearchCustomer]);

  //Delete customer
  const CustomerDeleteInfo = () => {
    setCustomer(null);
  };

  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  //#endregion

  //#region Product
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const onDeleteItem = (index: number) => {
    let _items = [...items];
    let _amount = amount - _items[index].line_amount_after_line_discount;
    setAmount(_amount);
    _items.splice(index, 1);
    setItems(_items);
  };

  const onChangeNote = (e: any, index: number) => {
    let value = e.target.value;
    let _items = [...items];
    _items[index].note = value;
    setItems(_items);
  };

  const onDiscountItem = (_items: Array<OrderItemModel>) => {
    setItems(_items);
    total();
  };

  const onChangeQuantity = (value: number, index: number) => {
    let _items = [...items];

    _items[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    setItems(_items);
    total();
  };

  const total = useCallback(() => {
    let _items = [...items];
    let _amount = 0;
    _items.forEach((i) => {
      let amountItem = (i.price - i.discount_items[0].value) * i.quantity;
      i.line_amount_after_line_discount = amountItem;
      i.amount = i.price * i.quantity;
      _amount += amountItem;
    });
    setItems(_items);
    setAmount(_amount);
  }, [items]);

  const showAddGiftModal = useCallback(
    (index: number) => {
      setIndexItem(index);
      setItemGift([...items[index].gifts]);
      setVisibleGift(true);
    },
    [items]
  );

  const createNewDiscountItem = () => {
    const newDiscountItem: OrderItemDiscountModel = {
      amount: 0,
      rate: 0,
      reason: "",
      value: 0,
    };
    return newDiscountItem;
  };

  const renderSearchVariant = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100" style={{ width: "100%" }}>
          <img
            src={avatar === "" ? imgdefault : avatar}
            alt="anh"
            placeholder={imgdefault}
          />
          <div className="rs-info w-100">
            <span style={{ color: "#37394D" }} className="text">
              {item.name}
            </span>
            <span style={{ color: "#95A1AC" }} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right">
          <span style={{ color: "#37394D" }} className="text t-right">
            {findPrice(item.variant_prices, AppConfig.currency)}
          </span>
          <span style={{ color: "#95A1AC" }} className="text t-right p-4">
            Có thể bán{" "}
            <span
              style={{
                color:
                  item.inventory > 0
                    ? "rgba(0, 128, 255, 1)"
                    : "rgba(226, 67, 67, 1)",
              }}
            >
              {item.inventory}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach(
      (item: VariantResponse, index: number) => {
        options.push({
          label: renderSearchVariant(item),
          value: item.id ? item.id.toString() : "",
        });
      }
    );
    return options;
  }, [resultSearchVariant]);

  const createItem = (variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem: OrderItemDiscountModel = createNewDiscountItem();
    let orderLine: OrderItemModel = {
      id: new Date().getTime(),
      sku: variant.sku,
      variant_id: variant.id,
      product_id: variant.product.id,
      variant: variant.name,
      variant_barcode: variant.barcode,
      product_type: variant.product.product_type,
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant.product.unit,
      warranty: variant.product.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      tax_include: true,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
    };
    return orderLine;
  };

  const onSearchVariantSelect = useCallback(
    (v, o) => {
      let _items = [...items].reverse();
      let indexSearch = resultSearchVariant.items.findIndex((s) => s.id == v);
      console.log(indexSearch);
      let index = _items.findIndex((i) => i.variant_id == v);
      let r: VariantResponse = resultSearchVariant.items[indexSearch];
      if (r.id == v) {
        if (splitLine || index === -1) {
          const item: OrderItemModel = createItem(r);
          _items.push(item);
          setAmount(amount + item.price);
          setSplitLine(false);
        } else {
          let lastIndex = index;
          _items.forEach((value, _index) => {
            if (_index > lastIndex) {
              lastIndex = _index;
            }
          });
          _items[lastIndex].quantity += 1;
          _items[lastIndex].line_amount_after_line_discount +=
            items[lastIndex].price - _items[lastIndex].discount_items[0].amount;
          setAmount(
            amount +
              _items[lastIndex].price -
              _items[lastIndex].discount_items[0].amount
          );
        }
      }
      setItems(_items.reverse());
      autoCompleteRef.current?.blur();
      setKeysearchVariant("");
    },
    [resultSearchVariant, items, splitLine]
    // autoCompleteRef, dispatch, resultSearch
  );

  const onChangeProductSearch = useCallback(
    (value) => {
      setKeysearchVariant(value);
      initQueryVariant.info = value;
      dispatch(
        searchVariantsOrderRequestAction(
          initQueryVariant,
          setResultSearchVariant
        )
      );
    },
    [dispatch]
  );

  const ShowDiscountModal = useCallback(() => {
    setVisiblePickDiscount(true);
  }, [setVisiblePickDiscount]);

  const onCancleDiscountConfirm = useCallback(() => {
    setVisiblePickDiscount(false);
  }, []);

  const onOkDiscountConfirm = (
    type: string,
    value: number,
    rate: number,
    counpon: string
  ) => {
    if (amount === 0) {
      showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu");
    } else {
      setVisiblePickDiscount(false);
      setDiscountType(type);
      setDiscountValue(value);
      setDiscountRate(rate);
      setCounpon(counpon);
      showSuccess("Thêm chiết khấu thành công");
    }
  };

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div>Sản phẩm</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    width: 255,
    className: "yody-pos-name",
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              onClick={() => onDeleteItem(index)}
              style={{ float: "left", marginRight: "13px" }}
            >
              <img src={deleteIcon} alt="" />
            </Button>
            <div style={{ width: "calc(100% - 32px)", float: "left" }}>
              <div className="yody-pos-sku">
                <Typography.Link style={{ color: "#2A2A86" }}>
                  {l.sku}
                </Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          {l.gifts.map((a, index1) => (
            <div key={index1} className="yody-pos-addition yody-pos-gift">
              <div>
                <img src={giftIcon} alt="" /> {a.variant}{" "}
                <span>({a.quantity})</span>
              </div>
            </div>
          ))}

          <div className="yody-pos-note" hidden={!l.show_note && l.note === ""}>
            <Input
              addonBefore={<EditOutlined />}
              maxLength={255}
              allowClear={true}
              onBlur={() => {
                if (l.note === "") {
                  let _items = [...items];
                  _items[index].show_note = false;
                  setItems(_items);
                }
              }}
              className="note"
              value={l.note}
              onChange={(e) => onChangeNote(e, index)}
              placeholder="Ghi chú"
            />
          </div>
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
    width: 95,
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="yody-pos-qtt">
          <InputNumber
            onChange={(value) => onChangeQuantity(value, index)}
            value={l.quantity}
            min={1}
            max={9999}
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
    width: 130,
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="yody-pos-price">
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="VD: 100,000"
            style={{ minWidth: 110, maxWidth: 130, textAlign: "right" }}
            value={l.price.toString()}
            onChange={(e) => console.log(1)}
          />
        </div>
      );
    },
  };

  const DiscountColumnt = {
    title: "Chiết khấu",
    align: "center",
    width: 185,
    className: "yody-table-discount text-right",
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="site-input-group-wrapper">
          <DiscountGroup
            price={l.price}
            index={index}
            discountRate={l.discount_items[0].rate}
            discountValue={l.discount_items[0].value}
            totalAmount={l.discount_items[0].amount}
            items={items}
            setItems={onDiscountItem}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    className: "yody-table-total-money text-right",
    // width: 100,
    render: (l: OrderItemModel, item: any, index: number) => {
      return <div>{formatCurrency(l.line_amount_after_line_discount)}</div>;
    },
  };

  const ActionColumn = {
    title: "Thao tác",
    width: 85,
    className: "yody-table-action text-center",
    render: (l: OrderItemModel, item: any, index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu">
          <Menu.Item key="0">
            <Button
              type="text"
              onClick={() => showAddGiftModal(index)}
              className="p-0 m-0 w-100"
            >
              Thêm quà tặng
            </Button>
          </Menu.Item>
          <Menu.Item key="1">
            <Button
              type="text"
              onClick={() => {
                let _items = [...items];
                _items[index].show_note = true;
                setItems(_items);
              }}
              className="p-0 m-0 w-100"
            >
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

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
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
  //#endregion

  //#region Shipment
  const ShipMethodOnChange = (value: number) => {
    setShipmentMethod(value);
  };

  const ChangeStore = (value: number) => {
    StoreDetailAction(value, setStoreDetail);
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );
  //#endregion

  //#region Payment
  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod("cash");
    }
  };

  const handleInputPoint = (index: number, point: number) => {
    paymentData[index].point = point;
    paymentData[index].amount = point * 1000;
    setPaymentData([...paymentData]);
  };

  const ListMaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => item.code !== "card");
  }, [listPaymentMethod]);

  const totalAmountPaid = useMemo(() => {
    let total = 0;
    paymentData.forEach((p) => (total = total + p.amount));
    return total;
  }, [paymentData]);

  const moneyReturn = useMemo(() => {
    return amount - totalAmountPaid;
  }, [amount, totalAmountPaid]);

  const handlePickPaymentMethod = (code?: string) => {
    let paymentMaster = ListMaymentMethods.find((p) => code === p.code);
    if (!paymentMaster) return;
    let indexPayment = paymentData.findIndex((p) => p.code === code);
    if (indexPayment === -1) {
      paymentData.push({
        payment_method_id: paymentMaster.id,
        amount: 0,
        paid_amount: 0,
        return_amount: 0,
        status: "",
        name: paymentMaster.name,
        code: paymentMaster.code,
        payment_method: paymentMaster.name,
        reference: "",
        source: "",
        customer_id: 1,
        note: "",
        type: "",
      });
    } else {
      paymentData.splice(indexPayment, 1);
    }
    setPaymentData([...paymentData]);
  };

  const handleInputMoney = (index: number, amount: number) => {
    if (paymentData[index].code === PaymentMethodCode.POINT) {
      paymentData[index].point = amount;
      paymentData[index].amount = amount * 1000;
      paymentData[index].paid_amount = amount * 1000;
    } else {
      paymentData[index].amount = amount;
      paymentData[index].paid_amount = amount;
    }
    setPaymentData([...paymentData]);
  };
  //#endregion
  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);

  
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  useLayoutEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);
  return (
    <div className="orders">
      <Form layout="vertical">
        <Row gutter={20}>
          {/* Left Side */}
          <Col md={18}>
            <Card
              title={
                <div className="d-flex">
                  <img src={peopleIcon2} alt="" /> Khách hàng
                </div>
              }
              extra={
                <div className="d-flex align-items-center form-group-with-search">
                  <Form.Item
                    name="source"
                    style={{ margin: "10px 0px" }}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nguồn đơn hàng",
                      },
                    ]}
                  >
                    <div className="display-flex align-item-center">
                      <Space>
                        <div>
                          Nguồn <span className="text-error">*</span>
                        </div>
                        <Select
                          style={{ width: 300 }}
                          showArrow
                          placeholder="Chọn nguồn đơn hàng"
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
                          suffix={
                            <Button
                              style={{ width: 36, height: 36 }}
                              icon={<PlusOutlined />}
                            />
                          }
                        >
                          {listSources.map((item, index) => (
                            <Select.Option
                              style={{ width: "100%" }}
                              key={index.toString()}
                              value={item.id}
                            >
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </div>
                  </Form.Item>
                </div>
              }
            >
              <div className="padding-lef-right" style={{ paddingTop: "15px" }}>
                {customer === null && (
                  <div>
                    <div className="padding-bottom-5">
                      <label htmlFor="">Tên khách hàng</label>
                    </div>
                    <AutoComplete
                      notFoundContent={
                        keysearchCustomer.length >= 3
                          ? "Không tìm thấy khách hàng"
                          : undefined
                      }
                      value={keysearchCustomer}
                      ref={autoCompleteRef}
                      onSelect={SearchCustomerSelect}
                      dropdownClassName="search-layout-customer dropdown-search-header"
                      dropdownMatchSelectWidth={456}
                      className="w-100"
                      style={{ width: "100%" }}
                      onSearch={CustomerChangeSearch}
                      options={CustomerConvertResultSearch}
                    >
                      <Input.Search
                        placeholder="Tìm hoặc thêm khách hàng"
                        className="border-input"
                        enterButton={
                          <Button
                            style={{ width: 40, height: 36 }}
                            icon={<PlusOutlined />}
                          ></Button>
                        }
                        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                      />
                    </AutoComplete>
                    <Divider className="margin-0" />
                  </div>
                )}
              </div>
              <div>
                {customer !== null && (
                  <div className="padding-lef-right">
                    <Space size={55}>
                      <Space>
                        <Avatar size={32}>A</Avatar>
                        <Link to="#">{customer.full_name}</Link>
                        <Tag className="orders-tag orders-tag-vip">
                          <b>{customer.customer_level}</b>
                        </Tag>
                      </Space>
                      <Space className="customer-detail-phone">
                        <span className="customer-detail-icon">
                          <img src={callIcon} alt="" />
                        </span>
                        <span className="customer-detail-text">
                          {customer?.phone === undefined
                            ? "0987654321"
                            : customer?.phone}
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
                            {customer?.loyalty === undefined
                              ? "0"
                              : customer?.loyalty}
                          </Typography.Text>
                        </span>
                      </Space>

                      <Space className="customer-detail-birthday">
                        <span className="customer-detail-icon">
                          <img src={bithdayIcon} alt="" />
                        </span>
                        <span className="customer-detail-text">
                          {customerBirthday}
                        </span>
                      </Space>

                      <Space className="customer-detail-action">
                        <Button
                          type="text"
                          className="p-0 ant-btn-custom"
                          //   onClick={ShowCustomerModal}
                        >
                          <img src={editBlueIcon} alt="" />
                        </Button>
                        <Button
                          type="text"
                          className="p-0 ant-btn-custom"
                          onClick={CustomerDeleteInfo}
                        >
                          <img src={deleteRedIcon} alt="" />
                        </Button>
                      </Space>
                    </Space>
                    <Divider className="margin-0" />
                    {customer.shipping_addresses !== undefined && (
                      <Row gutter={24}>
                        <Col
                          xs={24}
                          lg={12}
                          className="font-weight-500 customer-info-left"
                        >
                          <div className="title-address">Địa chỉ giao hàng</div>
                          <Row className="customer-row-info">
                            <img
                              src={peopleIcon2}
                              alt=""
                              style={{ width: 19 }}
                            />{" "}
                            <span style={{ marginLeft: 9 }}>
                              {shippingAddress?.name}
                            </span>
                          </Row>
                          <Row className="customer-row-info">
                            <img src={callIcon} alt="" style={{ width: 19 }} />{" "}
                            <span style={{ marginLeft: 9 }}>
                              {shippingAddress?.phone}
                            </span>
                          </Row>
                          <Row className="customer-row-info">
                            <img
                              src={locationIcon}
                              alt=""
                              style={{ width: 19 }}
                            />{" "}
                            <span style={{ marginLeft: 9 }}>
                              {shippingAddress?.full_address}
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
                                  <Button
                                    type="link"
                                    // onClick={ShowAddressModal}
                                  >
                                    Thêm địa chỉ mới
                                  </Button>
                                </Row>
                              }
                              content={
                                <div className="change-shipping-address-content">
                                  {customer.shipping_addresses.map(
                                    (item, index) => (
                                      <div
                                        className="shipping-address-row"
                                        // onClick={(e) =>
                                        //   SelectShippingAddress(item)
                                        // }
                                      >
                                        <div className="shipping-address-name">
                                          Địa chỉ 1{" "}
                                          <Button
                                            type="text"
                                            // onClick={ShowAddressModal}
                                            className="p-0"
                                          >
                                            <img src={editBlueIcon} alt="" />
                                          </Button>
                                        </div>
                                        <div className="shipping-customer-name">
                                          {item.name}
                                        </div>
                                        <div className="shipping-customer-mobile">
                                          {item.phone}
                                        </div>
                                        <div className="shipping-customer-address">
                                          {item.full_address}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              }
                              trigger="click"
                              visible={visibleShippingAddress}
                              //   onVisibleChange={
                              //     handleVisibleShippingAddressChange
                              //   }
                              className="change-shipping-address"
                            >
                              <Button type="link" className="btn-style">
                                Thay đổi địa chỉ giao hàng
                              </Button>
                            </Popover>
                          </Row>
                        </Col>
                        <Col xs={24} lg={12} className="font-weight-500">
                          <Form.Item
                            name="customer_note"
                            label="Ghi chú của khách hàng"
                          >
                            <Input.TextArea
                              placeholder="Điền ghi chú"
                              rows={4}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
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

                      {customer.billing_addresses !== undefined && (
                        <Row gutter={24} hidden={isVisibleBilling}>
                          <Col
                            xs={24}
                            lg={12}
                            className="font-weight-500 customer-info-left"
                          >
                            <div className="title-address">
                              Địa chỉ giao hàng
                            </div>
                            <Row className="customer-row-info">
                              <img
                                src={peopleIcon2}
                                alt=""
                                style={{ width: 19 }}
                              />{" "}
                              <span style={{ marginLeft: 9 }}>
                                {shippingAddress?.name}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <img
                                src={callIcon}
                                alt=""
                                style={{ width: 19 }}
                              />{" "}
                              <span style={{ marginLeft: 9 }}>
                                {shippingAddress?.phone}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <img
                                src={locationIcon}
                                alt=""
                                style={{ width: 19 }}
                              />{" "}
                              <span style={{ marginLeft: 9 }}>
                                {shippingAddress?.full_address}
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
                                    <Button
                                      type="link"
                                      //   onClick={ShowAddressModal}
                                    >
                                      Thêm địa chỉ mới
                                    </Button>
                                  </Row>
                                }
                                content={
                                  <div className="change-shipping-address-content">
                                    {customer.billing_addresses.map(
                                      (item, index) => (
                                        <div
                                          className="shipping-address-row"
                                          //   onClick={(e) =>
                                          //     SelectBillingAddress(item)
                                          //   }
                                        >
                                          <div className="shipping-address-name">
                                            Địa chỉ 1{" "}
                                            <Button
                                              type="text"
                                              //   onClick={ShowAddressModal}
                                              className="p-0"
                                            >
                                              <img src={editBlueIcon} alt="" />
                                            </Button>
                                          </div>
                                          <div className="shipping-customer-name">
                                            {item.name}
                                          </div>
                                          <div className="shipping-customer-mobile">
                                            {item.phone}
                                          </div>
                                          <div className="shipping-customer-address">
                                            {item.full_address}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                }
                                trigger="click"
                                visible={visibleBillingAddress}
                                className="change-shipping-address"
                              >
                                <Button type="link" className="btn-style">
                                  Thay đổi địa chỉ gửi hóa đơn
                                </Button>
                              </Popover>
                            </Row>
                          </Col>
                          <Col xs={24} lg={12} className="font-weight-500">
                            <Form.Item name="email" label="Email hóa đơn đến">
                              <Input
                                type="email"
                                placeholder="Nhập email hoá đơn đến"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <img src={productIcon} alt="" /> Sản phẩm
                </Space>
              }
              extra={
                <Space size={20}>
                  <Checkbox onChange={() => setSplitLine(!splitLine)}>
                    Tách dòng
                  </Checkbox>
                  <span>Chính sách giá</span>
                  <Form.Item name="price_type" style={{ margin: "0px" }}>
                    <Select
                      defaultValue="retail_price"
                      style={{ minWidth: 150 }}
                    >
                      <Select.Option value="retail_price">
                        Giá bán lẻ
                      </Select.Option>
                      <Select.Option value="whole_sale_price">
                        Giá bán buôn
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Link className="text-focus" to="#">
                    <Space>
                      <ShopOutlined /> Xem tồn <ArrowRightOutlined />
                    </Space>
                  </Link>
                </Space>
              }
            >
              <div className="padding-20">
                <Row gutter={20}>
                  <Col md={8}>
                    <Form.Item
                      label="Cửa hàng"
                      name="store_id"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn cửa hàng",
                        },
                      ]}
                    >
                      <Select
                        className="select-with-search"
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="Chọn cửa hàng"
                        onChange={ChangeStore}
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
                        {dataCanAccess.map((item, index) => (
                          <Select.Option key={index.toString()} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={16}>
                    <Form.Item label="Sản phẩm">
                      <AutoComplete
                        notFoundContent={
                          keysearchVariant.length >= 3
                            ? "Không tìm thấy sản phẩm"
                            : undefined
                        }
                        value={keysearchVariant}
                        ref={autoCompleteRef}
                        onSelect={onSearchVariantSelect}
                        dropdownClassName="search-layout dropdown-search-header"
                        dropdownMatchSelectWidth={456}
                        className="w-100"
                        onSearch={onChangeProductSearch}
                        options={convertResultSearchVariant}
                      >
                        <Input
                          size="middle"
                          className="yody-search"
                          placeholder="Tìm sản phẩm theo tên/ SKU (F3)"
                          prefix={
                            <SearchOutlined style={{ color: "#ABB4BD" }} />
                          }
                        />
                      </AutoComplete>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
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
                      onClick={() => {
                        autoCompleteRef.current?.focus();
                      }}
                    >
                      Thêm sản phẩm ngay (F3)
                    </Button>
                  ),
                }}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={items}
                className="sale-product-box-table w-100"
                tableLayout="fixed"
                pagination={false}
              />
              <div className="padding-20" style={{ paddingTop: "30px" }}>
                <Row className="sale-product-box-payment" gutter={24}>
                  <Col xs={24} lg={12}>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Bỏ chiết khấu tự động
                      </Checkbox>
                    </div>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Không tính thuế VAT
                      </Checkbox>
                    </div>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Bỏ tích điểm tự động
                      </Checkbox>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Row className="payment-row" justify="space-between">
                      <strong className="font-size-text">Tổng tiền</strong>
                      <strong className="font-size-text">
                        {formatCurrency(amount)}
                      </strong>
                    </Row>

                    <Row
                      className="payment-row"
                      justify="space-between"
                      align="middle"
                      style={{ marginTop: "5px" }}
                    >
                      <Space align="center">
                        <Typography.Link
                          className="font-weight-500"
                          onClick={ShowDiscountModal}
                          style={{ borderBottom: "1px dashed #0080FF" }}
                        >
                          Chiết khấu
                        </Typography.Link>

                        {}
                        <Tag
                          className="orders-tag orders-tag-danger"
                          closable
                          onClose={() => {
                            setDiscountRate(0);
                            setDiscountValue(0);
                          }}
                        >
                          {discountRate !== 0 ? discountRate : 0}%{" "}
                        </Tag>
                      </Space>
                      <div className="font-weight-500 ">
                        {formatCurrency(discountValue)}
                      </div>
                    </Row>

                    <Row
                      className="payment-row"
                      justify="space-between"
                      align="middle"
                      style={{ marginTop: "5px" }}
                    >
                      <Space align="center">
                        <Typography.Link
                          className="font-weight-500"
                          onClick={ShowDiscountModal}
                        >
                          Mã giảm giá
                        </Typography.Link>

                        {counpon !== "" && (
                          <Tag
                            className="orders-tag orders-tag-danger"
                            closable
                            onClose={() => {
                              setDiscountRate(0);
                              setDiscountValue(0);
                            }}
                          >
                            {counpon}{" "}
                          </Tag>
                        )}
                      </Space>
                      <div className="font-weight-500 ">0</div>
                    </Row>

                    <Row
                      className="payment-row padding-top-10"
                      justify="space-between"
                    >
                      <div className="font-weight-500">Phí ship báo khách</div>
                      <div className="font-weight-500 payment-row-money">
                        20,000
                      </div>
                    </Row>
                    <Divider className="margin-top-5 margin-bottom-5" />
                    <Row className="payment-row" justify="space-between">
                      <strong className="font-size-text">Khách cần trả</strong>
                      <strong className="text-success font-size-text">
                        {formatCurrency(changeMoney)}
                      </strong>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
            <PickDiscountModal
              amount={amount}
              type={discountType}
              value={discountValue}
              rate={discountRate}
              counpon={counpon}
              onCancel={onCancleDiscountConfirm}
              onOk={onOkDiscountConfirm}
              visible={isVisiblePickDiscount}
            />
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <ProfileOutlined />
                  Đóng gói và giao hàng
                </Space>
              }
            >
              <div className="padding-20">
                <Row gutter={20}>
                  <Col md={12}>
                    <Form.Item
                      label={<i style={{marginBottom:"15px"}}>Lựa chọn 1 trong hình thức giao hàng</i>}
                      required
                    >
                      <Radio.Group
                        value={shipmentMethod}
                        onChange={(e) => ShipMethodOnChange(e.target.value)}
                      >
                        <Space direction="vertical" size={15}>
                          <Radio value={1}>Chuyển đối tác giao hàng</Radio>
                          <Radio value={2}>Tự giao hàng</Radio>
                          <Radio value={3}>Nhận tại cửa hàng</Radio>
                          <Radio value={4}>Giao hàng sau</Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col md={12}>
                    <Form.Item label="Hẹn giao">
                      <Select showArrow placeholder="Chọn hẹn giao"></Select>
                    </Form.Item>
                    <Form.Item label="Yêu cầu">
                      <Select
                        className="select-with-search"
                        showSearch
                        showArrow
                        style={{ width: "100%" }}
                        placeholder="Chọn yêu cầu"
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
                        {shipping_requirements?.map((item, index) => (
                          <Select.Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.value}
                          >
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={20} hidden={shipmentMethod !== 2}>
                  <Col md={12}>
                    <Form.Item label="Đối tác giao hàng">
                      <Select
                        className="select-with-search"
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="Chọn đối tác giao hàng"
                        suffix={
                          <Button
                            style={{ width: 36, height: 36 }}
                            icon={<PlusOutlined />}
                          />
                        }
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
                        {shipper?.map((item, index) => (
                          <Select.Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.id}
                          >
                            {item.full_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="Phí ship trả đối tác giao hàng">
                      <Input placeholder="Phí ship trả đối tác giao hàng" />
                    </Form.Item>
                  </Col>
                  <Col md={12}>
                    <Form.Item label="Phí ship báo khách">
                      <Input placeholder="Phí ship báo khách" />
                    </Form.Item>
                  </Col>
                </Row>

                {/*--- Nhận tại cửa hàng ----*/}
                <div className="receive-at-store" hidden={shipmentMethod !== 3}>
                  <Row style={{ marginBottom: "10px" }}>Nhận tại cửa hàng</Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={storeBluecon} alt="" width="20px" />
                      </div>
                      <div className="row-info-title">Cửa hàng</div>
                      <div className="row-info-content">
                        <Typography.Link>{storeDetail?.name}</Typography.Link>
                      </div>
                    </Space>
                  </Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={callIcon} alt="" width="18px" />
                      </div>
                      <div className="row-info-title">Điện thoại</div>
                      <div className="row-info-content">
                        {storeDetail?.hotline}
                      </div>
                    </Space>
                  </Row>
                  <Row className="row-info">
                    <Space>
                      <div className="row-info-icon">
                        <img src={locationIcon} alt="" width="18px" />
                      </div>
                      <div className="row-info-title">Địa chỉ</div>
                      <div className="row-info-content">
                        {storeDetail?.address}
                      </div>
                    </Space>
                  </Row>
                </div>

                {/*--- Giao hàng sau ----*/}
                <Row className="ship-later-box" hidden={shipmentMethod !== 4}>
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
              className="margin-top-20"
              title={
                <Space>
                  <CreditCardOutlined />
                  Thanh toán
                </Space>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
                  required
                >
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => changePaymentMethod(e.target.value)}
                  >
                    <Space size={20}>
                      <Radio value={1}>COD</Radio>
                      <Radio value={2}>Thanh toán trước</Radio>
                      <Radio value={3}>Thanh toán sau</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Row
                  gutter={24}
                  className="payment-cod-box"
                  hidden={paymentMethod !== 1}
                >
                  <Col xs={24} lg={6}>
                    <Form.Item label="Tiền thu hộ">
                      <InputNumber
                        placeholder="Nhập số tiền"
                        className="form-control text-right hide-handler-wrap w-100"
                        style={{ width: "100%" }}
                        min={0}
                        max={999999999999}
                        value={amount}
                        formatter={(value) =>
                          formatCurrency(value ? value : "0")
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24} hidden={paymentMethod !== 2}>
                  <Col xs={24} lg={24}>
                    <div className="form-group form-group-with-search">
                      <i>
                        Lựa chọn 1 hoặc nhiều phương thức thanh toán trước *
                      </i>
                    </div>
                  </Col>
                  <Col xs={24} lg={24}>
                    <Row
                      className="btn-list-method"
                      gutter={5}
                      align="middle"
                      style={{ marginLeft: 0, marginRight: 0 }}
                    >
                      {ListMaymentMethods.map((method, index) => {
                        let icon = null;
                        switch (method.code) {
                          case PaymentMethodCode.CASH:
                            icon = <Cash />;
                            break;
                          case PaymentMethodCode.CARD:
                          case PaymentMethodCode.BANK_TRANSFER:
                            icon = <CreditCardOutlined />;
                            break;
                          case PaymentMethodCode.QR_CODE:
                            icon = <QrcodeOutlined />;
                            break;
                          case PaymentMethodCode.POINT:
                            icon = <YdCoin />;
                            break;
                          default:
                            icon = <BugOutlined />;
                            break;
                        }
                        return (
                          <Col key={method.code} className="btn-payment-method">
                            <Button
                              type={
                                paymentData.some((p) => p.code === method.code)
                                  ? "primary"
                                  : "default"
                              }
                              value={method.id}
                              icon={icon}
                              size="large"
                              onClick={() => {
                                handlePickPaymentMethod(method.code);
                              }}
                              className=""
                            >
                              {method.name}
                            </Button>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Row
                      gutter={24}
                      className="row-price"
                      style={{ padding: "5px 0px" }}
                    >
                      <Col xs={13} lg={15} className="row-large-title">
                        Khách cần trả
                      </Col>
                      <Col
                        className="lbl-money"
                        xs={11}
                        lg={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                        }}
                      >
                        <span className="t-result-blue">
                          {formatCurrency(amount)}
                        </span>
                      </Col>
                    </Row>

                    {paymentData.map((method, index) => {
                      return (
                        <Row
                          gutter={24}
                          className="row-price"
                          style={{ padding: "5px 0" }}
                          key={index}
                        >
                          <Col xs={24} lg={15}>
                            <Row align="middle">
                              {method.name}
                              {method.code === PaymentMethodCode.POINT ? (
                                <div>
                                  <span
                                    style={{
                                      fontSize: 14,
                                      marginLeft: 5,
                                    }}
                                  >
                                    {" "}
                                    (1 điểm = 1,000₫)
                                  </span>
                                  <InputNumber
                                    value={method.point}
                                    style={{
                                      width: 100,
                                      marginLeft: 7,
                                      fontSize: 17,
                                      paddingTop: 4,
                                      paddingBottom: 4,
                                    }}
                                    className="hide-number-handle"
                                    onFocus={(e) => e.target.select()}
                                    formatter={(value) =>
                                      formatSuffixPoint(value ? value : "0")
                                    }
                                    parser={(value) =>
                                      replaceFormat(value ? value : "0")
                                    }
                                    min={0}
                                    max={99999}
                                    onChange={(value) => {
                                      handleInputPoint(index, value);
                                    }}
                                  />
                                </div>
                              ) : null}
                            </Row>
                          </Col>
                          <Col className="lbl-money" xs={22} lg={6}>
                            <InputNumber
                              size="middle"
                              min={0}
                              max={999999999999}
                              value={method.amount}
                              disabled={method.code === PaymentMethodCode.POINT}
                              className="yody-payment-input hide-number-handle"
                              formatter={(value) =>
                                formatCurrency(value ? value : "0")
                              }
                              placeholder="Nhập tiền mặt"
                              style={{ textAlign: "right", width: "100%" }}
                              onChange={(value) =>
                                handleInputMoney(index, value)
                              }
                              onFocus={(e) => e.target.select()}
                            />
                          </Col>
                          <Col span={2} style={{ paddingLeft: 0 }}>
                            <Button
                              type="text"
                              className="p-0 m-0"
                              onClick={() => {
                                handlePickPaymentMethod(method.code);
                              }}
                            >
                              <img src={deleteIcon} alt="" />
                            </Button>
                          </Col>
                        </Row>
                      );
                    })}
                    <Row
                      gutter={24}
                      className="row-price total-customer-pay"
                      style={{ marginLeft: 0, marginRight: 0 }}
                    >
                      <Col
                        xs={13}
                        lg={15}
                        className="row-large-title"
                        style={{ paddingLeft: 0 }}
                      >
                        Tổng số tiền khách trả
                      </Col>
                      <Col
                        className="lbl-money"
                        xs={11}
                        lg={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                          paddingRight: 3,
                        }}
                      >
                        <span>{formatCurrency(totalAmountPaid)}</span>
                      </Col>
                    </Row>
                    <Row
                      gutter={24}
                      className="row-price"
                      style={{ padding: "5px 0" }}
                    >
                      <Col xs={12} lg={15} className="row-large-title">
                        {moneyReturn > 0 ? "Tiền thiếu" : "Tiền thừa"}
                      </Col>
                      <Col
                        className="lbl-money"
                        xs={12}
                        lg={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                        }}
                      >
                        <span
                          style={{ color: moneyReturn <= 0 ? "blue" : "red" }}
                        >
                          {formatCurrency(Math.abs(moneyReturn))}
                        </span>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <Card
              title={
                <Space>
                  <ProfileOutlined />
                  Thông tin đơn hàng
                </Space>
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
                </Form.Item>
                <Form.Item
                  label="Tham chiếu"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input placeholder="Điền tham chiếu" />
                </Form.Item>
                <Form.Item
                  label="Đường dẫn"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input placeholder="Điền đường dẫn" />
                </Form.Item>
              </div>
            </Card>
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <ProfileOutlined />
                  Thông tin bổ sung
                </Space>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label="Ghi chú"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input.TextArea placeholder="Điền Ghi chú" />
                </Form.Item>
                <Form.Item
                  label="Tag"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags"
                    tokenSeparators={[","]}
                  ></Select>
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>
        <div className="margin-top-10" style={{ textAlign: "right" }}>
          <Space size={12}>
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
