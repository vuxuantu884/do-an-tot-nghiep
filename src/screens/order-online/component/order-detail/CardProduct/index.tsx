import { EditOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Dropdown,
  Form,
  FormInstance,
  Input,
  Menu, Row, Select, Space,
  Table,
  Tooltip
} from "antd";
// import _ from "lodash";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import giftIcon from "assets/icon/gift.svg";
import imgDefault from "assets/icon/img-default.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import {
  StoreGetListAction,
  StoreSearchListAction
} from "domain/actions/core/store.action";
import { splitOrderAction } from "domain/actions/order/order.action";
import {
  SearchBarCode,
  searchVariantsOrderRequestAction
} from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { OrderItemDiscountModel } from "model/other/order/order-model";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderItemDiscountRequest, OrderLineItemRequest, SplitOrderRequest } from "model/request/order.request";
import { OrderResponse } from "model/response/order/order.response";
import { OrderConfigResponseModel } from "model/response/settings/order-settings.response";
import React, {
  createRef,
  useCallback, useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AddGiftModal from "screens/order-online/modal/add-gift.modal";
import InventoryModal from "screens/order-online/modal/inventory.modal";
import PickDiscountModal from "screens/order-online/modal/pick-discount.modal";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  getTotalAmount,
  getTotalAmountAfterDiscount,
  getTotalDiscount,
  getTotalQuantity,
  haveAccess,
  replaceFormatString
} from "utils/AppUtils";
import { MoneyType } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { applyDiscount } from "../../../../../service/promotion/discount/discount.service";
import DiscountGroup from "../../discount-group";
import CardProductBottom from "./CardProductBottom";
import { StyledComponent } from "./styles";

type CardProductProps = {
  storeId: number | null;
  selectStore: (item: number) => void;
  shippingFeeInformedToCustomer: number | null;
  setItemGift: (item: []) => void;
  changeInfo: (
    items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => void;
  formRef: React.RefObject<FormInstance<any>>;
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (items: Array<OrderLineItemRequest>) => void;
  isCloneOrder?: boolean;
  discountRate: number;
  setDiscountRate: (item: number) => void;
  discountValue: number;
  setDiscountValue: (item: number) => void;
  inventoryResponse: Array<InventoryResponse> | null;
  setInventoryResponse: (item: Array<InventoryResponse> | null) => void;
  setStoreForm: (id: number | null) => void;
  levelOrder?: number;
  updateOrder?: boolean;
  orderId?: string;
  isSplitOrder?: boolean;
  orderDetail?: OrderResponse | null;
  orderConfig: OrderConfigResponseModel | null | undefined;
  fetchData?: () => void;
};

var barcode = "";

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
};

const CardProduct: React.FC<CardProductProps> = (props: CardProductProps) => {
  const {
    formRef,
    items,
    discountRate,
    setDiscountRate,
    discountValue,
    setDiscountValue,
    storeId,
    inventoryResponse,
    selectStore,
    handleCardItems,
    levelOrder = 0,
    orderId,
    isSplitOrder,
    orderDetail,
    fetchData,
    orderConfig,
  } = props;
  const dispatch = useDispatch();
  const [loadingAutomaticDiscount, setLoadingAutomaticDiscount] = useState(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
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
  const [isVisibleGift, setVisibleGift] = useState(false);
  const [searchProducts, setSearchProducts] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<string>(MoneyType.MONEY);
  const [changeMoney, setChangeMoney] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>("");
  const [isShowProductSearch, setIsShowProductSearch] = useState(false);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);

  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);

  //tách đơn
  const [splitOrderNumber, setSplitOrderNumber] = useState(0);
  const [isShowSplitOrder, setIsShowSplitOrder] = useState(false);

  const [storeArrayResponse, setStoreArrayResponse] =
    useState<Array<StoreResponse> | null>([]);

  const event = useCallback((event:KeyboardEvent)=>{
    if (event.target instanceof HTMLBodyElement) {
      if (event.key !== "Enter") {
          barcode = barcode + event.key;
      } else if (event.key === "Enter") {
          if (barcode !== "" && event && items) {
              dispatch(
                SearchBarCode(barcode, async (data: VariantResponse) => {
                  let _items = [...items].reverse();
                  const item: OrderLineItemRequest = await createItem(data);
                  let index = _items.findIndex((i) => i.variant_id === data.id);
                  item.position = items.length + 1;

                  if (splitLine || index === -1) {
                    _items.push(item);
                    await handleAutomaticDiscount(_items, item, splitLine);
                    setAmount(amount + item.price - item.discount_amount);
                    calculateChangeMoney(
                      _items,
                      amount + item.price - item.discount_amount,
                      discountRate,
                      discountValue
                    );
                  } else {
                    let variantItems = _items.filter((item) => item.variant_id === data.id);
                    let lastIndex = variantItems.length - 1;
                    variantItems[lastIndex].quantity += 1;
                    variantItems[lastIndex].line_amount_after_line_discount +=
                      variantItems[lastIndex].price -
                      (variantItems[lastIndex].discount_amount);
                    await handleAutomaticDiscount(_items, item, splitLine);
                    setAmount(
                      amount +
                        variantItems[lastIndex].price -
                        (variantItems[lastIndex].discount_amount)
                    );

                    calculateChangeMoney(
                      _items,
                      amount +
                        variantItems[lastIndex].price -
                      (variantItems[lastIndex].discount_amount),
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
              barcode = "";
          }
      }
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[items]);

  useEffect(() => {
    window.addEventListener("keypress", event);
    return () => {
        window.removeEventListener("keypress", event);
    };
}, [event]);

  useEffect(() => {
    if (coupon && items) {
      console.log("Apply coupon: ", coupon)
      // let _items = [...items];
      // applyCouponDiscount(_items);
      // let _amount = totalAmount(_items);
      // handleCardItems(_items);
      // setAmount(_amount);
      // calculateChangeMoney(_items, _amount, discountRate, discountValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  useEffect(() => {
    if (items) {
      let amount = totalAmount(items);
      setChangeMoney(amount);
      setAmount(amount);
      let _itemGifts: any = [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i].gifts) {
          return;
        }
        _itemGifts = [..._itemGifts, ...items[i].gifts];
      }
      props.setItemGift(_itemGifts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const showAddGiftModal = useCallback(
    (index: number) => {
      if (items) {
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
    console.log('handleChangeItems');
    if (!items) {
      return 0;
    }
    let _items = [...items];
    let _amount = totalAmount(_items);
    handleCardItems(_items);
    setAmount(_amount);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      _items.forEach(item => item.discount_items = [createNewDiscountItem()]);
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
      <Row>
        <Col
          span={4}
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            padding: "4px 6px",
          }}
        >
          <img
            src={avatar === "" ? imgDefault : avatar}
            alt="anh"
            placeholder={imgDefault}
            style={{width: "50%", borderRadius: 5}}
          />
        </Col>
        <Col span={14}>
          <div style={{padding: "5px 0"}}>
            <span
              className="searchDropdown__productTitle"
              style={{color: "#37394D"}}
              title={item.name}
            >
              {item.name}
            </span>
            <div style={{color: "#95A1AC"}}>{item.sku}</div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{textAlign: "right", padding: "0 20px"}}>
            <div style={{display: "inline-block", textAlign: "right"}}>
              <Col style={{color: "#222222"}}>
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
              </Col>
              <div style={{color: "#737373"}}>
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
              </div>
            </div>
          </div>
        </Col>
      </Row>
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

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{textAlign: "left"}}>Sản phẩm</div>
      </div>
    ),
    width: "34%",
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
          <div style={{marginTop: 5}}>
            {l.gifts &&
              l.gifts.map((a, index1) => (
                <div key={index1} className="yody-pos-addition yody-pos-gift">
                  <div>
                    <img src={giftIcon} alt="" />
                    <i style={{marginLeft: 7}}>
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
        <div style={{textAlign: "center"}}>Số lượng</div>
        {items && getTotalQuantity(items) > 0 && (
          <span style={{color: "#2A2A86"}}>({getTotalQuantity(items)})</span>
        )}
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "9%",
    align: "right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-qtt">
          <NumberInput
            style={{textAlign: "right", fontWeight: 500, color: "#222222"}}
            value={l.quantity}
            onChange={(value) => onChangeQuantity(value, index)}
            maxLength={4}
            minLength={0}
            disabled={levelOrder > 3}
          />
        </div>
      );
    },
  };

  const PriceColumnt = {
    title: () => (
      <div>
        <span style={{color: "#222222", textAlign: "right"}}>Đơn giá</span>
        <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "15%",
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
            disabled={levelOrder > 3}
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
    width: "20%",
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
            disabled={levelOrder > 3}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: () => (
      <div className="text-center">
        <span style={{color: "#222222"}}>Tổng tiền</span>
        <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
      </div>
    ),
    align: "right",
    className: "yody-table-total-money text-right",
    width: "12%",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-varian-name">
          {formatCurrency(l.line_amount_after_line_discount)}
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
    width: "10%",
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
          <div>
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
              disabled={levelOrder > 3}
            >
              <Button type="text" className="p-0 ant-btn-custom" style={{border: "0px"}}>
                <img src={arrowDownIcon} alt="" style={{width: 17}} />
              </Button>
            </Dropdown>
            <Button
              style={{background: "transparent", border: "0px"}}
              type="text"
              className="p-0 ant-btn-custom"
              onClick={() => onDeleteItem(index)}
              disabled={levelOrder > 3}
            >
              <img src={XCloseBtn} alt="" style={{width: 22}} />
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

  const handleAutomaticDiscount = async (_items: Array<OrderLineItemRequest>, item: OrderLineItemRequest, splitLine:boolean) => {
    let mostValueDiscount = 0;
    let quantity = splitLine ? _items.filter(i => i.variant_id === item.variant_id).length : item.quantity;
    try {
      const checkingDiscountResponse = await applyDiscount([{variant_id: item.variant_id, quantity}], "ADMIN");
      setLoadingAutomaticDiscount(false)
      if (item && checkingDiscountResponse &&
        checkingDiscountResponse.code === HttpStatus.SUCCESS &&
        checkingDiscountResponse.data.line_items.length
      ) {
        const suggested_discounts = checkingDiscountResponse.data.line_items.find(
          (lineItem: any) => lineItem.variant_id === item.variant_id
        )?.suggested_discounts;
        if (suggested_discounts && suggested_discounts.length > 0) {
          const quantity = item.quantity;
          const total = item.amount;
          mostValueDiscount = Math.max(...suggested_discounts.map((discount: any) => {
            let value = 0;
            if (discount.value_type === "FIXED_AMOUNT") {
              value = discount.value * quantity;
            } else if (discount.value_type === "PERCENTAGE") {
              value = total * (discount.value/100);
            } else if (discount.value_type === "FIXED_PRICE") {
              value = item.price - discount.value;
            }
            if (value > item.price) {
              value = item.price;
            }
            return value;
          }))
          const discountItem: OrderItemDiscountRequest = {
            rate: Math.round((mostValueDiscount/item.price) * 100 * 100) / 100,
            value: mostValueDiscount,
            amount: mostValueDiscount,
            reason: '',
          };
          item.discount_items[0] = discountItem;
        }
      }
    } catch (e) {
      console.log(e);
      showError("Thao tác thất bại");
      setLoadingAutomaticDiscount(false)
      return null;
    }

  }

  const onSearchVariantSelect = useCallback(
    async (v, o) => {
      if (!items) {
        return;
      }
      setLoadingAutomaticDiscount(true);
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
          await handleAutomaticDiscount(_items, item, splitLine)
          setAmount(amount + (item.price - item.discount_items[0].amount));
          calculateChangeMoney(
            _items,
            amount + item.price - item.discount_items[0].amount,
            discountRate,
            discountValue
          );
        } else {
          let variantItems = _items.filter((item) => item.variant_id === newV);
          let lastIndex = variantItems.length - 1;
          variantItems[lastIndex].quantity += 1;
          variantItems[lastIndex].line_amount_after_line_discount +=
            variantItems[lastIndex].price -
            (variantItems[lastIndex].discount_items[0].amount * variantItems[lastIndex].quantity);
          await handleAutomaticDiscount(_items, item, splitLine);
          setAmount(
            amount +
              variantItems[lastIndex].price -
              (variantItems[lastIndex].discount_items[0].amount)
          );

          calculateChangeMoney(
            _items,
            amount +
            variantItems[lastIndex].price -
            (variantItems[lastIndex].discount_items[0].amount),
            discountRate,
            discountValue
          );
        }
      }

      autoCompleteRef.current?.blur();
      setIsInputSearchProductFocus(false);
      setKeySearchVariant("");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resultSearchVariant, items, splitLine]
  );

  const onChangeProductSearch = useCallback(
    async (value: string) => {
      setIsInputSearchProductFocus(true);
      setKeySearchVariant(value);
      if (orderConfig?.allow_choose_item && value) {
        let isError = await formRef.current
          ?.validateFields(["store_id"])
          .then(() => {
            return false;
          })
          .catch(() => {
            return true;
          });
        if (isError) {
          return;
        }
      }

      initQueryVariant.info = value;
      if (value.trim()) {
        (async () => {
          setSearchProducts(true);
          try {
            await dispatch(
                searchVariantsOrderRequestAction(initQueryVariant, (data) => {
                setResultSearchVariant(data);
                setSearchProducts(false);
                setIsShowProductSearch(true);
              })
            );
          } catch {}
        })();
      } else {
        setSearchProducts(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formRef]
  );

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const ShowDiscountModal = useCallback(() => {
    setVisiblePickDiscount(true);
  }, [setVisiblePickDiscount]);

  const onCancelDiscountConfirm = useCallback(() => {
    setVisiblePickDiscount(false);
  }, []);

  const ShowInventoryModal = useCallback(() => {
    if (items !== null && items?.length) setInventoryModalVisible(true);
    else showError("Vui lòng chọn sản phẩm vào đơn hàng");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, items]);

  useEffect(() => {
    dispatch(StoreSearchListAction("", setStoreArrayResponse));
  }, [dispatch]);

  // const dataSearchCanAccess = useMemo(() => {
  //   let newData: Array<StoreResponse> = [];
  //   if (storeArrayResponse && storeArrayResponse != null) {
  //     newData = storeArrayResponse.filter((store) =>
  //       haveAccess(
  //         store.id,
  //         userReducer.account ? userReducer.account.account_stores : []
  //       )
  //     );
  //   }
  //   return newData;
  // }, [storeArrayResponse, userReducer.account]);

  const handleInventoryCancel = useCallback(() => {
    setInventoryModalVisible(false);
  }, []);

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

  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate: number,
    _discountValue: number
  ) => {
    console.log('_items: ', _items)
    console.log('_amount: ', _amount)
    console.log('_discountRate: ', _discountRate)
    console.log('_discountValue: ', _discountValue)
    props.changeInfo(_items, _amount, _discountRate, _discountValue);

  };

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length) {
      newData = listStores.filter((store) =>
        haveAccess(
          store.id,
          userReducer.account ? userReducer.account.account_stores : []
        )
      );
    }
    // set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên
    if (newData && newData[0]?.id) {
      formRef.current?.setFieldsValue({store_id: newData[0].id});
      selectStore(newData[0].id);
    }
    return newData;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStores, userReducer.account]);

  const onUpdateData = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      let data = [...items];
      setItemGift(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, itemGifts, indexItem]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  const onInputSearchProductFocus = () => {
    setIsInputSearchProductFocus(true);
  };

  const onInputSearchProductBlur = () => {
    setIsInputSearchProductFocus(false);
  };

  const handleSplitOrder = () => {
    if (!orderId || !orderDetail || !userReducer.account) {
      return;
    }
    if (splitOrderNumber === undefined) {
      showError("Vui lòng điền số lượng tách đơn!");
      return;
    }
    if (items && splitOrderNumber > items?.length) {
      showError("Số lượng tách đơn không được lớn hơn số lượng loại sản phẩm!");
      return;
    }
    if (splitOrderNumber < 2 || splitOrderNumber > 20) {
      showError("Số lượng tách đơn cần lớn hơn 1 và nhỏ hơn 20!");
      return;
    }

    const params: SplitOrderRequest = {
      order_code: orderDetail.code,
      quantity: splitOrderNumber,
      updated_by: userReducer.account.updated_by || "",
      updated_name: userReducer.account.updated_name || "",
    };
    dispatch(
      splitOrderAction(params, (response) => {
        if (response) {
          response.data.forEach((singleOrderId: number) => {
            const singleSplitLink = `${process.env.PUBLIC_URL}/orders/${singleOrderId}/update`;
            window.open(singleSplitLink, "_blank");
          });
          fetchData && fetchData();
        }
      })
    );
  };

  useEffect(() => {
    if (items && items.length > 0) {
      setIsShowProductSearch(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledComponent>
      <Card
        title="SẢN PHẨM"
        extra={
          <Space size={window.innerWidth > 1366 ? 20 : 10}>
            <Checkbox onChange={() => setSplitLine(!splitLine)}>Tách dòng</Checkbox>
            <span>Chính sách giá: 3</span>
            <Form.Item name="price_type">
              <Select style={{minWidth: 145, height: 38}} placeholder="Chính sách giá">
                <Select.Option value="retail_price" color="#222222">
                  Giá bán lẻ
                </Select.Option>
                <Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
              </Select>
            </Form.Item>
            <Button
              onClick={() => {
                ShowInventoryModal();
              }}
            >
              Kiểm tra tồn
            </Button>
            {isSplitOrder && (
              <div className="splitOrder">
                <Checkbox onChange={(e) => setIsShowSplitOrder(e.target.checked)}>
                  Tách đơn
                </Checkbox>
                {isShowSplitOrder && (
                  <React.Fragment>
                    <NumberInput
                      style={{width: 50}}
                      value={splitOrderNumber}
                      onChange={(value) => {
                        if (value) {
                          setSplitOrderNumber(value);
                        } else {
                          setSplitOrderNumber(0);
                        }
                      }}
                    />
                    <Button
                      type="primary"
                      onClick={handleSplitOrder}
                      style={{padding: "0 10px"}}
                    >
                      Thực hiện
                    </Button>
                  </React.Fragment>
                )}
              </div>
            )}
          </Space>
        }
      >
        <Row gutter={15} className="rowSelectStoreAndProducts">
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
                allowClear
                style={{width: "100%"}}
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                onChange={(value?: number) => {
                  if (value) {
                    selectStore(value);
                    setIsShowProductSearch(true);
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
                disabled={levelOrder > 3}
              >
                {dataCanAccess.map((item, index) => (
                  <Select.Option key={index} value={item.id}>
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
                onFocus={onInputSearchProductFocus}
                onBlur={onInputSearchProductBlur}
                disabled={levelOrder > 3 || loadingAutomaticDiscount}
                dropdownRender={(menu) =>(
                  <div>
                    {menu}
                  </div>
                )}
              >
                <Input
                  size="middle"
                  className="yody-search"
                  placeholder="Tìm sản phẩm mã 7... (F3)"
                  prefix={
                    searchProducts ? (
                      <LoadingOutlined style={{color: "#2a2a86"}} />
                    ) : (
                      <SearchOutlined style={{color: "#ABB4BD"}} />
                    )
                  }
                  disabled={levelOrder > 3}
                />
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>
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
                  disabled={levelOrder > 3}
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
          // scroll={{ y: 300 }}
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
                  {formatCurrency(getTotalAmountAfterDiscount(items))}
                </div>
              </div>
            ) : (
              <div />
            )
          }
        />

        {/* nếu có sản phẩm trong đơn hàng mới hiển thị thông tin ở dưới  */}
        {items && items.length > 0 && (
          <CardProductBottom
            amount={amount}
            calculateChangeMoney={calculateChangeMoney}
            changeMoney={changeMoney}
            coupon={coupon}
            discountRate={discountRate}
            discountValue={discountValue}
            setDiscountRate={setDiscountRate}
            setDiscountValue={setDiscountValue}
            showDiscountModal={ShowDiscountModal}
            totalAmountOrder={amount}
            items={items}
            shippingFeeInformedToCustomer={props.shippingFeeInformedToCustomer}
          />
        )}

        <PickDiscountModal
          amount={amount}
          type={discountType}
          value={discountValue}
          rate={discountRate}
          onCancelDiscountModal={onCancelDiscountConfirm}
          onOkDiscountModal={onOkDiscountConfirm}
          visible={isVisiblePickDiscount}
        />
        <InventoryModal
          isModalVisible={isInventoryModalVisible}
          setInventoryModalVisible={setInventoryModalVisible}
          storeId={storeId}
          setStoreId={selectStore}
          columnsItem={items}
          inventoryArray={inventoryResponse}
          setStoreArrayResponse={setStoreArrayResponse}
          dataSearchCanAccess={storeArrayResponse}
          handleCancel={handleInventoryCancel}
          // setStoreForm={setStoreForm}
        />
      </Card>
    </StyledComponent>
  );
};

export default CardProduct;
