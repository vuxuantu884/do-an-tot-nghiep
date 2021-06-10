/* eslint-disable react-hooks/exhaustive-deps */
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Dropdown,
  Input,
  InputNumber,
  Menu,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { showError, showSuccess } from "utils/ToastUtils";
import { EditOutlined } from "@ant-design/icons";
import PickDiscountModal from "./modal/PickDiscountModal";
import arrowDownIcon from "../../assets/img/drow-down.svg";
import giftIcon from "assets/icon/gift.svg";
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useMemo,
  createRef,
} from "react";
import productIcon from "../../assets/img/cube.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import DiscountGroup from "./discount-group";
import { useDispatch, useSelector } from "react-redux";
import { getListStoreRequest } from "domain/actions/core/store.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  haveAccess,
  findPrice,
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  replaceFormat,
} from "../../utils/AppUtils";
import { RefSelectProps } from "antd/lib/select";
import { AppConfig } from "config/AppConfig";
import imgdefault from "assets/icon/img-default.svg";
import { Type } from "../../config/TypeConfig";
import "../../assets/css/container.scss";
import deleteIcon from "assets/icon/delete.svg";
import AddGiftModal from "./modal/AddGiftModal";
import {
  OrderItemDiscountModel,
  OrderItemModel,
} from "model/other/Order/order-model";
import { VariantSearchQuery } from "model/query/variant.search.query";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/response/base-metadata.response";
import { VariantResponse } from "model/response/products/variant.response";
import { StoreResponse } from "model/response/core/store.response";

type ProductCardProps = {
  storeId: number | null;
  selectStore: (item: number) => void;
  changeInfo: (
    items: Array<OrderItemModel>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => void;
  selectPriceType: (priceType: string) => void;
  isVisibleStore: boolean;
};

const initQuery: VariantSearchQuery = {
  limit: 10,
  page: 0,
};

const ProductCard: React.FC<ProductCardProps> = (props: ProductCardProps) => {
  const dispatch = useDispatch();
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderItemModel>>([]);
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [keysearch, setKeysearch] = useState("");
  const [resultSearch, setResultSearch] = useState<
    PageResponse<VariantResponse>
  >({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const [isVisibleGift, setVisibleGift] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<string>("money");
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

  const onChangeQuantity = (value: number, index: number) => {
    let _items = [...items];

    _items[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    setItems(_items);
    total();
  };

  const onDiscountItem = (_items: Array<OrderItemModel>) => {
    setItems(_items);
    total();
  };

  const total = useCallback(() => {
    let _items = [...items];
    let _amount = 0;
    _items.map((i) => {
      let amountItem = (i.price - i.discount_items[0].value) * i.quantity;
      i.line_amount_after_line_discount = amountItem;
      i.amount = i.price * i.quantity;
      _amount += amountItem;
    });
    setItems(_items);
    setAmount(_amount);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  }, [items]);

  // render

  const renderSearch = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100">
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
  const ProductColumn = {
    title: "Sản phẩm",
    width: 245,
    className: "yody-pos-name",
    render: (l: OrderItemModel, item: any, index: number) => {
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
    width: 85,
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
    //width: 100,
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="yody-pos-price">
          <InputNumber
            className="hide-number-handle"
            min={0}
            value={l.price}
            formatter={(value) => formatCurrency(value ? value : "0")}
            parser={(value) => replaceFormat(value ? value : "0")}
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
    align: "center",
    width: 165,
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

  useLayoutEffect(() => {
    dispatch(getListStoreAction(setListStores));
  }, [dispatch]);

  const autoCompleteRef = createRef<RefSelectProps>();

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
      let _items = [...items].reverse();
      let indexSearch = resultSearch.items.findIndex((s) => s.id == v);
      console.log(indexSearch);
      let index = _items.findIndex((i) => i.variant_id == v);
      let r: VariantResponse = resultSearch.items[indexSearch];
      if (r.id == v) {
        if (splitLine || index === -1) {
          const item: OrderItemModel = createItem(r);
          _items.push(item);
          calculateChangeMoney(
            _items,
            amount + item.price,
            discountRate,
            discountValue
          );
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
      setKeysearch("");
    },
    [resultSearch, items, splitLine]
    // autoCompleteRef, dispatch, resultSearch
  );

  const onChangeProductSearch = useCallback(
    (value) => {
      setKeysearch(value);
      initQuery.info = value;
      dispatch(searchVariantsOrderRequestAction(initQuery, setResultSearch));
    },
    [dispatch]
  );

  const convertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.items.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: renderSearch(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearch]);

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
    _items: Array<OrderItemModel>,
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
    (items: Array<OrderItemModel>) => {
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

  const onSelectPriceType = useCallback(
    (value: string) => {
      props.selectPriceType(value);
    },
    [props]
  );

  return (
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
            <div>
              <Checkbox
                checked={splitLine}
                className="checkbox-style"
                style={{ fontSize: 14 }}
                onChange={() => setSplitLine(!splitLine)}
              >
                Tách dòng
              </Checkbox>
            </div>
            <div className="price-policy">
              <label htmlFor="" style={{ marginRight: 10 }}>
                Chính sách giá
              </label>
              <Select
                defaultValue="retail_price"
                style={{ minWidth: 130 }}
                onChange={onSelectPriceType}
              >
                <Select.Option value="retail_price">Giá bán lẻ</Select.Option>
                <Select.Option value="whole_sale_price">
                  Giá bán buôn
                </Select.Option>
              </Select>
            </div>
            <div className="view-inventory-box">
              <Button type="link" className="p-0">
                <Space>
                  <img src={storeBluecon} alt="" />
                  Xem tồn
                  <ArrowRightOutlined />
                </Space>
              </Button>
            </div>
          </Space>
        </Row>
      }
    >
      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="required-label">
              Cửa hàng
            </label>
            <Select
              className="select-with-search"
              showSearch
              style={{ width: "100%" }}
              placeholder="Chọn cửa hàng"
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

            {props.isVisibleStore === true && (
              <div>
                <div
                  className="ant-form-item-explain ant-form-item-explain-error"
                  style={{ padding: "5px" }}
                >
                  <div role="alert">Vui lòng chọn cửa hàng</div>
                </div>
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} lg={16}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">
              Sản phẩm
            </label>
            <div>
              <AutoComplete
                notFoundContent={
                  keysearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined
                }
                value={keysearch}
                ref={autoCompleteRef}
                onSelect={onSearchVariantSelect}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeProductSearch}
                options={convertResultSearch}
              >
                <Input
                  size="middle"
                  className="yody-search"
                  placeholder="Tìm sản phẩm theo tên/ SKU (F3)"
                  prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                />
              </AutoComplete>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="sale-product-box">
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
          dataSource={items}
          className="sale-product-box-table w-100"
          tableLayout="fixed"
          pagination={false}
          // summary={(pageData) => {
          // let totalBorrow = 0;
          // let totalRepayment = 0;
          // // pageData.forEach(({ borrow, repayment }) => {
          // //   totalBorrow += borrow;
          // //   totalRepayment += repayment;
          // // });
          // return (
          //   <Table.Summary.Row>
          //     <Table.Summary.Cell index={1} colSpan={2}>
          //       Tổng
          //     </Table.Summary.Cell>
          //     <Table.Summary.Cell index={1} className="text-right">
          //       <Typography.Text>{formatCurrency(987000)}</Typography.Text>
          //     </Table.Summary.Cell>
          //     <Table.Summary.Cell index={1} className="text-right">
          //       <Typography.Text type="danger">
          //         {formatCurrency(296100)}
          //       </Typography.Text>
          //     </Table.Summary.Cell>
          //     <Table.Summary.Cell index={1} className="text-right">
          //       <Typography.Link>{formatCurrency(690900)}</Typography.Link>
          //     </Table.Summary.Cell>
          //     <Table.Summary.Cell index={1} />
          //   </Table.Summary.Row>
          // );
          // }}
        />
      </Row>

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
              {formatCurrency(amount)}
            </div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link
                className="font-weight-500"
                onClick={ShowDiscountModal}
              >
                Chiết khấu
              </Typography.Link>
              <div className="badge-style badge-danger">
                {discountRate !== null ? discountRate : 0}%{" "}
                <Button
                  type="text"
                  className="p-0"
                  onClick={() => {
                    setDiscountRate(0);
                    setDiscountValue(0);
                    calculateChangeMoney(items, amount, 0, 0);
                  }}
                >
                  x
                </Button>
              </div>
            </Space>
            <div className="font-weight-500 ">
              {formatCurrency(discountValue)}
            </div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link
                className="font-weight-500"
                onClick={ShowDiscountModal}
              >
                Mã giảm giá
              </Typography.Link>
              <div className="badge-style badge-primary">
                {counpon}{" "}
                <Button type="text" className="p-0">
                  x
                </Button>
              </div>
            </Space>
            <div className="font-weight-500 ">0</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Phí ship báo khách</div>
            <div className="font-weight-500 payment-row-money">20,000</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Khách cần trả</div>
            <div className="font-weight-500 payment-row-money">
              {/* <Typography.Text type="success" className="font-weight-500"> */}
              {formatCurrency(changeMoney)}
              {/* </Typography.Text> */}
            </div>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductCard;
