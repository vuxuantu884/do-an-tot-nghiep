/* eslint-disable react-hooks/exhaustive-deps */
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Dropdown,
  Input,
  Menu,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  Divider,
  Tag,
  Form,
} from "antd";

import arrowDownIcon from "assets/img/drow-down.svg";
import giftIcon from "assets/icon/gift.svg";
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useMemo,
  createRef,
} from "react";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import DiscountGroup from "./discount-group";
import { useDispatch, useSelector } from "react-redux";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { showError, showSuccess } from "utils/ToastUtils";
import NumberInput from "component/custom/number-input.custom";
import PickDiscountModal from "../modal/pick-discount.modal";
import {
  haveAccess,
  findPrice,
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  replaceFormatString,
  getTotalAmount,
  getTotalDiscount,
  getTotalAmountAfferDiscount,
  getTotalQuantity,
} from "utils/AppUtils";
import { RefSelectProps } from "antd/lib/select";
import { AppConfig } from "config/AppConfig";
import imgdefault from "assets/icon/img-default.svg";
import emptyProduct from "assets/icon/empty_products.svg";
import Xclosebtn from "assets/icon/X_close.svg";
import addIcon from "assets/img/plus_1.svg";
import { Type } from "config/TypeConfig";
import AddGiftModal from "../modal/add-gift.modal";
import { OrderItemDiscountModel } from "model/other/Order/order-model";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { StoreResponse } from "model/core/store.model";
import { MoneyType } from "utils/Constants";
import { OrderLineItemRequest } from "model/request/order.request";

type ProductCardProps = {
  storeId: number | null;
  selectStore: (item: number) => void;
  shippingFeeCustomer: number | null;
  changeInfo: (
    items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => void;
};

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
};

const ProductCard: React.FC<ProductCardProps> = (props: ProductCardProps) => {
  const dispatch = useDispatch();
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [keysearchVariant, setKeysearchVariant] = useState("");
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
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<string>(MoneyType.MONEY);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [changeMoney, setChangeMoney] = useState<number>(0);
  const [counpon, setCounpon] = useState<string>("");
  //Function
  const showAddGiftModal = useCallback(
    (index: number) => {
      setIndexItem(index);
      setItemGift([...items[index].gifts]);
      setVisibleGift(true);
    },
    [items]
  );

  const onChangeNote = (e: any, index: number) => {
    let value = e.target.value;
    let _items = [...items];
    _items[index].note = value;
    setItems(_items);
  };

  const onChangeQuantity = (value: number | null, index: number) => {
    let _items = [...items];

    _items[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    setItems(_items);
    total();
  };
  const onChangePrice = (value: number | null, index: number) => {
    let _items = [...items];
    if (value !== null) {
      _items[index].price = value;
    }
    setItems(_items);
    total();
  };

  const onDiscountItem = (_items: Array<OrderLineItemRequest>) => {
    setItems(_items);
    total();
  };
  
  const total = useCallback(() => {
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
    setItems(_items);
    setAmount(_amount);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  }, [items]);

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
              src={avatar === "" ? imgdefault : avatar}
              alt="anh"
              placeholder={imgdefault}
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
                  item.inventory > 0
                    ? "rgba(0, 128, 255, 1)"
                    : "rgba(226, 67, 67, 1)",
              }}
            >
              {` ${item.inventory}`}
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

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    width: "30%",
    className: "yody-pos-name",
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
          <div>
            {l.gifts.map((a, index1) => (
              <div key={index1} className="yody-pos-addition yody-pos-gift">
                <div>
                  <img src={giftIcon} alt="" /> {a.variant}{" "}
                  <span>({a.quantity})</span>
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
        <div style={{ textAlign: "center" }}>Số lượng</div>
        {getTotalQuantity(items) > 0 && (
          <span style={{ color: "#0080FF" }}>({getTotalQuantity(items)})</span>
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
      <div className="text-center">
        Đơn giá
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>
          ₫
        </span>
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
    title: "Chiết khấu",
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
            setItems={onDiscountItem}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: () => (
      <div className="text-center">
        Tổng tiền
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>
          ₫
        </span>
      </div>
    ),
    align: "center",
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
    title: "Thao tác",
    width: "12%",
    className: "yody-table-action text-center",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu">
          <Menu.Item key="0">
            <Button
              type="text"
              onClick={() => showAddGiftModal(index)}
              className="p-0 ant-btn-custom"
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
              className="p-0 ant-btn-custom"
            >
              Thêm ghi chú
            </Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div style={{ display: "flex" }}>
          <div
            className="site-input-group-wrapper saleorder-input-group-wrapper"
            style={{
              marginRight: 6,
              padding: 0,
              borderRadius: 5,
            }}
          >
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="p-0 ant-btn-custom"
                style={{ height: 36, width: 32 }}
              >
                <img src={arrowDownIcon} alt="" />
              </Button>
            </Dropdown>
          </div>
          <div>
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              onClick={() => onDeleteItem(index)}
              style={{ marginLeft: "8px" }}
            >
              <img src={Xclosebtn} alt="" />
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
      warranty: variant.product.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant.composite,
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
    let _items = [...items];
    let _amount = amount - _items[index].line_amount_after_line_discount;
    setAmount(_amount);
    _items.splice(index, 1);
    setItems(_items);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  };

  const onSearchVariantSelect = useCallback(
    (v, o) => {
      let newV = parseInt(v);
      let _items = [...items].reverse();
      let indexSearch = resultSearchVariant.items.findIndex(
        (s) => s.id === newV
      );
      let index = _items.findIndex((i) => i.variant_id === newV);
      let r: VariantResponse = resultSearchVariant.items[indexSearch];
      if (r.id === newV) {
        if (splitLine || index === -1) {
          const item: OrderLineItemRequest = createItem(r);
          _items.push(item);
          setAmount(amount + item.price);
          calculateChangeMoney(
            _items,
            amount + item.price,
            discountRate,
            discountValue
          );
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
          calculateChangeMoney(
            _items,
            amount +
              _items[lastIndex].price -
              _items[lastIndex].discount_items[0].amount,
            discountRate,
            discountValue
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

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
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
      calculateChangeMoney(items, amount, rate, value);
      showSuccess("Thêm chiết khấu thành công");
    }
  };

  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate: number,
    _discountValue: number
  ) => {
    setChangeMoney(_amount - _discountValue);
    props.changeInfo(_items, _amount, _discountRate, _discountValue);
  };

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
    setVisibleGift(false);
    let _items = [...items];
    _items[indexItem].gifts = itemGifts;
    setItems(_items);
  }, [items, itemGifts, indexItem]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">SẢN PHẨM</span>
        </div>
      }
      extra={
        <Space size={20}>
          <Checkbox onChange={() => setSplitLine(!splitLine)}>
            Tách dòng
          </Checkbox>
          <span>Chính sách giá:</span>
          <Form.Item name="price_type" style={{ margin: "0px" }}>
            <Select
              style={{ minWidth: 145, height: 38 }}
              placeholder="Chính sách giá"
            >
              <Select.Option value="retail_price" color="#222222">
                Giá bán lẻ
              </Select.Option>
              <Select.Option value="whole_sale_price">
                Giá bán buôn
              </Select.Option>
            </Select>
          </Form.Item>
          {/* <Link className="text-focus" to="#" style={{color: "#0080ff"}}>
            <Space style={{height: "17"}}>
              <ShopOutlined style={{color: "#0080ff"}}/> Xem tồn <ArrowRightOutlined style={{color: "#0080ff"}}/>
            </Space>
          </Link> */}
        </Space>
      }
    >
      <div style={{ padding: "24px 24px 0 24px" }}>
        <Row gutter={24}>
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
                notFoundContent="Không tìm thấy kết quả"
                onChange={props.selectStore}
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
                id="search_product"
                value={keysearchVariant}
                ref={autoCompleteRef}
                onSelect={onSearchVariantSelect}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeProductSearch}
                options={convertResultSearchVariant}
                maxLength={255}
                dropdownRender={(menu) => (
                  <div>
                    <div
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
                    <Divider style={{ margin: "4px 0" }} />
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
        className="sale-product-box-table w-100"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: 300 }}
        sticky
        footer={() =>
          items.length > 0 ? (
            <div className="row-footer-custom">
              <div
                className="yody-foot-total-text"
                style={{
                  width: "37%",
                  float: "left",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                Tổng
              </div>

              <div
                style={{
                  width: "20%",
                  float: "left",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {formatCurrency(getTotalAmount(items))}
              </div>

              <div
                style={{
                  width: "18%",
                  float: "left",
                  textAlign: "center",
                  color: "#E24343",
                  fontWeight: 500,
                }}
              >
                {formatCurrency(getTotalDiscount(items))}
              </div>

              <div
                style={{
                  width: "17%",
                  float: "left",
                  textAlign: "center",
                  color: "#0080FF",
                  fontWeight: 500,
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
      <div className="padding-24" style={{ paddingTop: "30px" }}>
        <Row className="sale-product-box-payment" gutter={24}>
          <Col xs={24} lg={12}>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
              >
                Bỏ chiết khấu tự động
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
              >
                Không tính thuế VAT
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
              >
                Bỏ tích điểm tự động
              </Checkbox>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Row className="payment-row" justify="space-between">
              <div className="font-weight-500">Tổng tiền</div>
              <div className="font-weight-500 ">{formatCurrency(amount)}</div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                {items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-500"
                    onClick={ShowDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Chiết khấu
                  </Typography.Link>
                ) : (
                  <div>Chiết khấu</div>
                )}

                {discountRate !== 0 && (
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
                {items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-500"
                    onClick={ShowDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Mã giảm giá
                  </Typography.Link>
                ) : (
                  <div>Mã giảm giá</div>
                )}

                {counpon !== "" && (
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
                    {counpon}{" "}
                  </Tag>
                )}
              </Space>
              <div className="font-weight-500 ">-</div>
            </Row>

            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Phí ship báo khách</div>
              <div className="font-weight-500 payment-row-money">
                {props.shippingFeeCustomer !== null
                  ? formatCurrency(props.shippingFeeCustomer)
                  : "-"}
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Khách cần phải trả:</strong>
              <strong className="text-success font-size-text">
                {changeMoney !== null || props.shippingFeeCustomer !== null
                  ? props.shippingFeeCustomer !== null
                    ? formatCurrency(changeMoney + props.shippingFeeCustomer)
                    : formatCurrency(changeMoney)
                  : "-"}
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
        counpon={counpon}
        onCancel={onCancleDiscountConfirm}
        onOk={onOkDiscountConfirm}
        visible={isVisiblePickDiscount}
      />
    </Card>
  );
};

export default ProductCard;
