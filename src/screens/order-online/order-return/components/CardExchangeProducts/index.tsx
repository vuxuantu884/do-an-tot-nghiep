/* eslint-disable react-hooks/exhaustive-deps */
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Form,
  FormInstance,
  Input,
  Menu,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import giftIcon from "assets/icon/gift.svg";
import imgDefault from "assets/icon/img-default.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  SearchBarCode,
  searchVariantsOrderRequestAction
} from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import {
  OrderItemDiscountModel,
  OrderSettingsModel
} from "model/other/order/order-model";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderLineItemRequest } from "model/request/order.request";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DiscountGroup from "screens/order-online/component/discount-group";
import AddGiftModal from "screens/order-online/modal/add-gift.modal";
import PickDiscountModal from "screens/order-online/modal/pick-discount.modal";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  getTotalAmount,
  getTotalAmountAfferDiscount,
  getTotalDiscount,
  getTotalQuantity,
  haveAccess,
  replaceFormatString
} from "utils/AppUtils";
import { MoneyType } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";

type CardProductProps = {
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (items: Array<OrderLineItemRequest>) => void;
  shippingFeeCustomer: number | null;
  amountReturn: number;
  totalAmountCustomerNeedToPay: number;
  orderSettings?: OrderSettingsModel;
  form: FormInstance<any>;
};

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
};

const CardExchangeProducts: React.FC<CardProductProps> = (props: CardProductProps) => {
  const {
    items,
    handleCardItems,
    amountReturn,
    totalAmountCustomerNeedToPay,
    orderSettings,
    form,
  } = props;
  console.log("amountReturn", amountReturn);
  const dispatch = useDispatch();
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [keySearchVariant, setKeySearchVariant] = useState("");
  const [resultSearchVariant, setResultSearchVariant] = useState<
    PageResponse<VariantResponse>
  >({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isShowProductSearch, setIsShowProductSearch] = useState(false);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);

  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [isVisibleGift, setVisibleGift] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<string>(MoneyType.MONEY);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [totalAmountExchange, setTotalAmountExchange] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>("");

  const [storeId, setStoreId] = useState<number | null>(null);

  const createOrderReturnContextData = useContext(CreateOrderReturnContext);
  console.log("createOrderReturnContextData", createOrderReturnContextData);

  //Function

  const totalAmount = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      if (!items) {
        return 0;
      }
      let _items = [...items];
      let _amount = 0;

      _items.forEach((i) => {
        let total_discount_items = 0;
        i.discount_items.forEach((d) => {
          total_discount_items = total_discount_items + d.value;
        });
        let amountItem = (i.price - total_discount_items) * i.quantity;
        i.line_amount_after_line_discount = amountItem;
        i.amount = i.price * i.quantity;
        _amount += amountItem;
        if (i.amount !== null) {
          let totalDiscount = 0;
          i.discount_items.forEach((a) => {
            totalDiscount = totalDiscount + a.amount;
          });
          i.discount_amount = totalDiscount;
        }
      });
      return _amount;
    },
    [items]
  );

  useEffect(() => {
    if (items) {
      let amount = totalAmount(items);
      console.log("amount", amount);
      setTotalAmountExchange(amount);
      setAmount(amount);
      let _itemGifts: any = [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i].gifts) {
          return;
        }
        _itemGifts = [..._itemGifts, ...items[i].gifts];
      }
      setItemGift(_itemGifts);
    }
  }, [items]);

  const showAddGiftModal = useCallback(
    (index: number) => {
      if (items) {
        console.log("items", items);
        setIndexItem(index);
        setItemGift([...items[index].gifts]);
        setVisibleGift(true);
      }
    },
    [items]
  );
  const onChangeNote = (e: any, index: number) => {
    let value = e.target.value;
    if (items) {
      let _items = [...items];
      _items[index].note = value;
      handleCardItems(_items);
    }
  };

  const handleChangeItems = useCallback(() => {
    if (!items) {
      return 0;
    }
    let _items = [...items];
    let _amount = totalAmount(_items);
    handleCardItems(_items);
    setAmount(_amount);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  }, [items]);

  const onChangeQuantity = (value: number | null, index: number) => {
    if (items) {
      let _items = [...items];

      _items[index].quantity = Number(
        value == null ? "0" : value.toString().replace(".", "")
      );
      handleCardItems(_items);
      handleChangeItems();
    }
  };
  const onChangePrice = (value: number | null, index: number) => {
    if (items) {
      let _items = [...items];
      if (value !== null) {
        _items[index].price = value;
      }
      handleCardItems(_items);
      handleChangeItems();
    }
  };

  const onDiscountItem = (_items: Array<OrderLineItemRequest>) => {
    handleCardItems(_items);
    handleChangeItems();
  };

  // render

  const renderSearchVariant = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <div
        className="row-search w-100"
        style={{ padding: 0, paddingRight: 20, paddingLeft: 20 }}
      >
        <div className="rs-left w-100" style={{ width: "100%" }}>
          <div style={{ marginTop: 10 }}>
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{ width: "40px", height: "40px", borderRadius: 5 }}
            />
          </div>
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
          <span style={{ color: "#222222" }} className="text t-right">
            {`${findPrice(item.variant_prices, AppConfig.currency)} `}
            <span
              style={{
                color: "#737373",
                textDecoration: "underline",
                textDecorationColor: "#737373",
              }}
            >
              đ
            </span>
          </span>
          <span style={{ color: "#737373" }} className="text t-right p-4">
            Có thể bán:
            <span
              style={{
                color:
                  (item.available === null ? 0 : item.available) > 0
                    ? "#2A2A86"
                    : "rgba(226, 67, 67, 1)",
              }}
            >
              {` ${item.available === null ? 0 : item.available}`}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  const getTotalAmountExchangeNeedToPay = () => {
    if (totalAmountExchange) {
      return (
        totalAmountExchange + (props.shippingFeeCustomer ? props.shippingFeeCustomer : 0)
      );
    }
    return 0;
  };

  const totalAmountExchangeNeedToPay = getTotalAmountExchangeNeedToPay();

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
      </div>
    ),
    width: "30%",
    className: "yody-pos-name 2",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div
          className="w-100"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "calc(100% - 32px)",
                float: "left",
              }}
            >
              <div className="yody-pos-sku">
              <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${l.product_id}/variants/${l.variant_id}`}
                >
                  {l.sku}
                </Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 2 }}>
            {l.gifts &&
              l.gifts.map((a, index1) => (
                <div key={index1} className="yody-pos-addition yody-pos-gift">
                  <div>
                    <img src={giftIcon} alt="" />
                    <i style={{ marginLeft: 7 }}>
                      {a.variant} ({a.quantity})
                    </i>
                  </div>
                </div>
              ))}
          </div>
          <div className="yody-pos-note" hidden={!l.show_note && l.note === ""}>
            <Input
              addonBefore={<EditOutlined />}
              maxLength={255}
              allowClear={true}
              onBlur={() => {
                if (l.note === "") {
                  if (!items) {
                    return;
                  }
                  let _items = [...items];
                  _items[index].show_note = false;
                  handleCardItems(_items);
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
        <div style={{ textAlign: "center" }}>Số lượng</div>
        {items && getTotalQuantity(items) > 0 && (
          <span style={{ color: "#2A2A86" }}>({getTotalQuantity(items)})</span>
        )}
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "12%",
    align: "right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-qtt">
          <NumberInput
            style={{ textAlign: "right", fontWeight: 500, color: "#222222" }}
            value={l.quantity}
            onChange={(value) => onChangeQuantity(value, index)}
            maxLength={4}
            minLength={0}
          />
        </div>
      );
    },
  };

  const PriceColumnt = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>Đơn giá</span>
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "17%",
    align: "center",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div>
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="VD: 100,000"
            style={{
              textAlign: "right",
              width: "100%",
              fontWeight: 500,
              color: "#222222",
            }}
            maxLength={14}
            minLength={0}
            value={l.price}
            onChange={(value) => onChangePrice(value, index)}
          />
        </div>
      );
    },
  };

  const DiscountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Chiết khấu</div>
      </div>
    ),
    align: "center",
    width: "22%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="site-input-group-wrapper saleorder-input-group-wrapper">
          <DiscountGroup
            price={l.price}
            index={index}
            discountRate={l.discount_items[0].rate}
            discountValue={l.discount_items[0].value}
            totalAmount={l.discount_items[0].amount}
            items={items}
            handleCardItems={onDiscountItem}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: () => (
      <div className="text-center">
        <span style={{ color: "#222222" }}>Tổng tiền</span>
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    align: "right",
    className: "yody-table-total-money text-right",
    width: "14%",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-varian-name">
          {formatCurrency(Math.round(l.line_amount_after_line_discount))}
        </div>
      );
    },
  };

  const ActionColumn = {
    title: () => (
      <div className="text-center">
        <div>Thao tác</div>
      </div>
    ),
    width: "12%",
    className: "saleorder-product-card-action ",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <Menu.Item key="1">
            <Button
              type="text"
              onClick={() => showAddGiftModal(index)}
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
              }}
            >
              Thêm quà tặng
            </Button>
          </Menu.Item>
          <Menu.Item key="2">
            <Button
              type="text"
              onClick={() => {
                if (!items) {
                  return;
                }
                let _items = [...items];
                _items[index].show_note = true;
                handleCardItems(_items);
              }}
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
              }}
            >
              Thêm ghi chú
            </Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "right",
          }}
        >
          <div
            className="site-input-group-wrapper saleorder-input-group-wrapper"
            style={{
              borderRadius: 5,
            }}
          >
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <Button type="text" className="p-0 ant-btn-custom" style={{border:"0px"}}>
                <img src={arrowDownIcon} alt="" style={{ width: 17 }} />
              </Button>
            </Dropdown>
          </div>
          <div className="saleorder-close-btn">
            <Button
              style={{ background: "transparent", border:"0px" }}
              type="text"
              className="p-0 ant-btn-custom"
              onClick={() => onDeleteItem(index)}
            >
              <img src={XCloseBtn} alt="" style={{ width: 22 }} />
            </Button>
          </div>
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

  const autoCompleteRef = createRef<RefSelectProps>();
  const createItem = (variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem: OrderItemDiscountModel = createNewDiscountItem();
    let orderLine: OrderLineItemRequest = {
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
      weight: variant.weight,
      weight_unit: variant.weight_unit,
      warranty: variant.product.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant.composite,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      // tax_include: true,
      tax_include: null,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
      available:variant.available
    };
    return orderLine;
  };

  const createNewDiscountItem = () => {
    const newDiscountItem: OrderItemDiscountModel = {
      amount: 0,
      rate: 0,
      reason: "",
      value: 0,
    };
    return newDiscountItem;
  };

  const onDeleteItem = (index: number) => {
    if (!items) {
      return;
    }
    let _items = [...items];
    let _amount = amount - _items[index].line_amount_after_line_discount;
    setAmount(_amount);
    _items.splice(index, 1);
    handleCardItems(_items);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  };

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores != null) {
      newData = listStores.filter(
        // tạm thời bỏ điều kiện để show cửa hàng
        (store) =>
          haveAccess(
            store.id,
            userReducer.account ? userReducer.account.account_stores : []
          )
        // store
      );
    }
    return newData;
  }, [listStores, userReducer.account]);

  const onSearchVariantSelect = useCallback(
    (v, o) => {
      if (!items) {
        return;
      }
      let newV = parseInt(v);
      let _items = [...items].reverse();
      let indexSearch = resultSearchVariant.items.findIndex((s) => s.id === newV);
      let index = _items.findIndex((i) => i.variant_id === newV);
      let r: VariantResponse = resultSearchVariant.items[indexSearch];
      const item: OrderLineItemRequest = createItem(r);
      item.position = items.length + 1;
      if (r.id === newV) {
        if (splitLine || index === -1) {
          _items.push(item);
          setAmount(amount + item.price);
          calculateChangeMoney(_items, amount + item.price, discountRate, discountValue);
        } else {
          let variantItems = _items.filter((item) => item.variant_id === newV);
          let lastIndex = variantItems.length - 1;
          variantItems[lastIndex].quantity += 1;
          variantItems[lastIndex].line_amount_after_line_discount +=
            variantItems[lastIndex].price -
            variantItems[lastIndex].discount_items[0].amount;
          setAmount(
            amount +
              variantItems[lastIndex].price -
              variantItems[lastIndex].discount_items[0].amount
          );
          calculateChangeMoney(
            _items,
            amount +
              variantItems[lastIndex].price -
              variantItems[lastIndex].discount_items[0].amount,
            discountRate,
            discountValue
          );
        }
      }
      handleCardItems(_items.reverse());
      autoCompleteRef.current?.blur();
      setKeySearchVariant("");
    },
    [resultSearchVariant, items, splitLine]
    // autoCompleteRef, dispatch, resultSearch
  );

  const onChangeProductSearch = (value: string) => {
    if (orderSettings?.chonCuaHangTruocMoiChonSanPham) {
      if (value) {
        form.validateFields(["store_id"]);
      }
    }
    setKeySearchVariant(value);
    initQueryVariant.info = value;
    dispatch(searchVariantsOrderRequestAction(initQueryVariant, setResultSearchVariant));
  };

  const ShowDiscountModal = useCallback(() => {
    setVisiblePickDiscount(true);
  }, [setVisiblePickDiscount]);

  const onCancelDiscountConfirm = useCallback(() => {
    setVisiblePickDiscount(false);
  }, []);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  const onOkDiscountConfirm = (
    type: string,
    value: number,
    rate: number,
    coupon: string
  ) => {
    if (amount === 0) {
      showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu");
    } else {
      setVisiblePickDiscount(false);
      setDiscountType(type);
      setDiscountValue(value);
      setDiscountRate(rate);
      setCoupon(coupon);
      if (items) {
        calculateChangeMoney(items, amount, rate, value);
      }
      showSuccess("Thêm chiết khấu thành công");
    }
  };

  const changeInfo = (
    _items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    handleCardItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
  };

  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate: number,
    _discountValue: number
  ) => {
    setTotalAmountExchange(_amount - _discountValue);
    changeInfo(_items, _amount, _discountRate, _discountValue);
  };

  const onUpdateData = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      let data = [...items];
      setItemGift(data);
    },
    [items]
  );

  const onCancleConfirm = useCallback(() => {
    setVisibleGift(false);
  }, []);

  const onOkConfirm = useCallback(() => {
    if (!items) {
      return;
    }
    setVisibleGift(false);
    let _items = [...items];
    let _itemGifts = [...itemGifts];
    _itemGifts.forEach((itemGift) => (itemGift.position = _items[indexItem].position));
    _items[indexItem].gifts = itemGifts;
    handleCardItems(_items);
  }, [items, itemGifts, indexItem]);

  const event = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        if (
          event.keyCode === 13 &&
          event.target.value &&
          event.target.id === "search_product" &&
          orderSettings?.chonCuaHangTruocMoiChonSanPham &&
          items &&
          storeId
        ) {
          // event.target.onchange=()=>{
          //   event.preventDefault();
          //   event.stopPropagation();
          // }
          let barcode = event.target.value;

          dispatch(
            SearchBarCode(barcode, (data: VariantResponse) => {
              let _items = [...items].reverse();
              const item: OrderLineItemRequest = createItem(data);
              let index = _items.findIndex((i) => i.variant_id === data.id);
              item.position = items.length + 1;

              if (splitLine || index === -1) {
                _items.push(item);
                setAmount(amount + item.price);
                calculateChangeMoney(
                  _items,
                  amount + item.price,
                  discountRate,
                  discountValue
                );
              } else {
                let variantItems = _items.filter((item) => item.variant_id === data.id);
                let lastIndex = variantItems.length - 1;
                variantItems[lastIndex].quantity += 1;
                variantItems[lastIndex].line_amount_after_line_discount +=
                  variantItems[lastIndex].price -
                  variantItems[lastIndex].discount_items[0].amount;
                setAmount(
                  amount +
                    variantItems[lastIndex].price -
                    variantItems[lastIndex].discount_items[0].amount
                );
                calculateChangeMoney(
                  _items,
                  amount +
                    variantItems[lastIndex].price -
                    variantItems[lastIndex].discount_items[0].amount,
                  discountRate,
                  discountValue
                );
              }

              handleCardItems(_items.reverse());
              autoCompleteRef.current?.blur();
              setIsInputSearchProductFocus(false);
              setKeySearchVariant("");
            })
          );
        }
      }
    },
    [items, splitLine, storeId]
  );

  useEffect(() => {
    window.addEventListener("keydown", event);
  }, [event]);

  return (
    <Card
      title="Thông tin sản phẩm đổi"
      extra={
        <Space size={20}>
          <Checkbox onChange={() => setSplitLine(!splitLine)}>Tách dòng</Checkbox>
          <span>Chính sách giá:</span>
          <Form.Item name="price_type" style={{ margin: "0px" }}>
            <Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
              <Select.Option value="retail_price" color="#222222">
                Giá bán lẻ
              </Select.Option>
              <Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
            </Select>
          </Form.Item>
        </Space>
      }
    >
      <div>
        <Row gutter={24}>
          <Col md={8}>
            <Form.Item
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
                // allowClear
                style={{ width: "100%" }}
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                onChange={(value?: number) => {
                  if (value) {
                    setIsShowProductSearch(true);
                    setStoreId(value);
                  } else {
                    setIsShowProductSearch(false);
                  }
                }}
                filterOption={(input, option) => {
                  if (option) {
                    return (
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
            <Form.Item>
              <AutoComplete
                notFoundContent={
                  keySearchVariant.length >= 3 ? "Không tìm thấy sản phẩm" : undefined
                }
                id="search_product"
                value={keySearchVariant}
                ref={autoCompleteRef}
                onSelect={onSearchVariantSelect}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeProductSearch}
                options={convertResultSearchVariant}
                maxLength={255}
                open={isShowProductSearch && isInputSearchProductFocus}
                onFocus={() => setIsInputSearchProductFocus(true)}
                onBlur={() => setIsInputSearchProductFocus(false)}
                dropdownRender={(menu) => (
                  <div>
                    {/* <div
                      className="row-search w-100"
                      style={{
                        minHeight: "42px",
                        lineHeight: "50px",
                        cursor: "pointer",
                      }}
                    >
                      <div className="rs-left w-100">
                        <div style={{ float: "left", marginLeft: "20px" }}>
                          <img src={addIcon} alt="" />
                        </div>
                        <div className="rs-info w-100">
                          <span
                            className="text"
                            style={{ marginLeft: "23px", lineHeight: "18px" }}
                          >
                            Thêm mới sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                    <Divider style={{ margin: "4px 0" }} /> */}
                    {menu}
                  </div>
                )}
              >
                <Input
                  size="middle"
                  className="yody-search"
                  placeholder="Tìm sản phẩm mã 7... (F3)"
                  prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                />
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>
      </div>
      <AddGiftModal
        items={itemGifts}
        onUpdateData={onUpdateData}
        onCancel={onCancleConfirm}
        onOk={onOkConfirm}
        visible={isVisibleGift}
      />
      <Table
        locale={{
          emptyText: (
            <div className="sale_order_empty_product">
              <img src={emptyProduct} alt="empty product"></img>
              <p>Đơn hàng của bạn chưa có sản phẩm nào!</p>
              <Button
                type="text"
                className="font-weight-500"
                style={{
                  background: "rgba(42,42,134,0.05)",
                }}
                onClick={() => {
                  autoCompleteRef.current?.focus();
                }}
              >
                Thêm sản phẩm ngay (F3)
              </Button>
            </div>
          ),
        }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={items}
        className="sale-product-box-table2 w-100"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: 300 }}
        sticky
        footer={() =>
          items && items.length > 0 ? (
            <div className="row-footer-custom">
              <div
                className="yody-foot-total-text"
                style={{
                  width: "37%",
                  float: "left",
                  fontWeight: 700,
                }}
              >
                TỔNG
              </div>

              <div
                style={{
                  width: "16%",
                  float: "left",
                  textAlign: "right",
                  fontWeight: 400,
                }}
              >
                {formatCurrency(getTotalAmount(items))}
              </div>

              <div
                style={{
                  width: "21%",
                  float: "left",
                  textAlign: "right",
                  fontWeight: 400,
                }}
              >
                {formatCurrency(getTotalDiscount(items))}
              </div>

              <div
                style={{
                  width: "14.5%",
                  float: "left",
                  textAlign: "right",
                  color: "#000000",
                  fontWeight: 700,
                }}
              >
                {formatCurrency(getTotalAmountAfferDiscount(items))}
              </div>
            </div>
          ) : (
            <div />
          )
        }
      />
      <div style={{ paddingTop: "30px" }}>
        <Row className="sale-product-box-payment" gutter={24}>
          <Col xs={24} lg={11}>
            <div className="payment-row">
              <Checkbox className="" style={{ fontWeight: 500 }}>
                Bỏ chiết khấu tự động
              </Checkbox>
            </div>
          </Col>
          <Col xs={24} lg={11}>
            <Row className="payment-row" style={{ justifyContent: "space-between" }}>
              <div className="font-weight-500">Tổng tiền:</div>
              <div className="font-weight-500" style={{ fontWeight: 500 }}>
                {formatCurrency(amount)}
              </div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                {items && items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-400"
                    onClick={ShowDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Chiết khấu:
                  </Typography.Link>
                ) : (
                  <div>Chiết khấu</div>
                )}

                {discountRate !== 0 && items && (
                  <Tag
                    style={{
                      marginTop: 0,
                      color: "#E24343",
                      backgroundColor: "#F5F5F5",
                    }}
                    className="orders-tag orders-tag-danger"
                    closable
                    onClose={() => {
                      setDiscountRate(0);
                      setDiscountValue(0);
                      calculateChangeMoney(items, amount, 0, 0);
                    }}
                  >
                    {discountRate !== 0 ? discountRate : 0}%{" "}
                  </Tag>
                )}
              </Space>
              <div className="font-weight-500 ">
                {discountValue ? formatCurrency(discountValue) : "-"}
              </div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                {items && items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-400"
                    onClick={ShowDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Mã giảm giá:
                  </Typography.Link>
                ) : (
                  <div>Mã giảm giá</div>
                )}

                {coupon !== "" && (
                  <Tag
                    style={{
                      margin: 0,
                      color: "#E24343",
                      backgroundColor: "#F5F5F5",
                    }}
                    className="orders-tag orders-tag-danger"
                    closable
                    onClose={() => {
                      setDiscountRate(0);
                      setDiscountValue(0);
                    }}
                  >
                    {coupon}{" "}
                  </Tag>
                )}
              </Space>
              <div className="font-weight-500 ">-</div>
            </Row>
            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Phí ship báo khách:</div>
              <div className="font-weight-500 payment-row-money">
                {props.shippingFeeCustomer !== null
                  ? formatCurrency(props.shippingFeeCustomer)
                  : "-"}
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền hàng mua:</strong>
              <strong>
                {totalAmountExchangeNeedToPay
                  ? formatCurrency(totalAmountExchangeNeedToPay)
                  : "-"}
              </strong>
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền hàng trả:</strong>
              <strong>
                {formatCurrency(amountReturn)}
              </strong>
            </Row>
            <Divider
              className="margin-top-5 margin-bottom-5"
              style={{ height: "auto", margin: "10px 0" }}
            />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">
                {totalAmountCustomerNeedToPay >= 0
                  ? "Khách cần trả: "
                  : "Cần trả lại khách: "}
              </strong>
              <strong className="text-success font-size-price">
                {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
              </strong>
            </Row>
          </Col>
        </Row>
      </div>

      <PickDiscountModal
        amount={amount}
        type={discountType}
        value={discountValue}
        rate={discountRate}
        coupon={coupon}
        onCancel={onCancelDiscountConfirm}
        onOk={onOkDiscountConfirm}
        visible={isVisiblePickDiscount}
      />
    </Card>
  );
};

export default CardExchangeProducts;
