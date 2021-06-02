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
import "../../assets/css/order.scss";
import arrowDownIcon from "../../assets/img/drow-down.svg";
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
import deleteRedIcon from "../../assets/img/deleteRed.svg";
import DiscountGroup from "./discountGroup";
import { StoreModel } from "model/other/StoreModel";
import { useDispatch, useSelector } from "react-redux";
import {
  getListStoreRequest,
  validateStoreAction,
} from "domain/actions/store.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OnSearchChange } from "domain/actions/search.action";
import {
  formatCurrency,
  replaceFormat,
  haveAccess,
  findPrice,
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
} from "../../utils/AppUtils";
import { RefSelectProps } from "antd/lib/select";
import { VariantModel } from "model/other/ProductModel";
import { OrderItemModel } from "model/other/Order/OrderItemModel";
import { OrderItemDiscountModel } from "model/other/Order/OrderItemDiscountModel";
import { AppConfig } from "config/AppConfig";
import imgdefault from "assets/icon/img-default.svg";
import { Type } from "../../config/TypeConfig";
import "./container.scss";
import { addOrderRequest } from "domain/actions/order.action";
import { splitLineChange } from "domain/actions/appsetting.action";
import deleteIcon from "assets/icon/delete.svg";

type ProductCardProps = {};

const renderSearch = (item: VariantModel) => {
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

const ProductCard: React.FC<ProductCardProps> = (props: ProductCardProps) => {
  const ProductColumn = {
    title: "Sản phẩm",
    className: "yody-pos-name",
    render: (l: OrderItemModel, item: any, index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <Button
              type="text"
              className="p-0 yody-pos-delete-free-form"
            >
              <img src={deleteIcon} alt="" />
            </Button>
            <div style={{ width: "calc(100% - 32px)", marginLeft: '15px' }}>
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
        </div>
      );
    },
  };

  const onChangeQuantity = (e:any, i:number) =>{
    let _items = [... items]
    let value = e.target.value
    console.log(value)
    _items[i].quantity = value
    setItems(_items)
  }

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    // width: 80,
    render: (l: OrderItemModel, item:any, index: number) => {
      return (
        <div className="yody-pos-qtt">
          <Input
            onChange={e => onChangeQuantity(e,index)}
            value={l.quantity}
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
    render: (l:OrderItemModel, item: any, index: number) => {
      return (
        <div className="yody-pos-price">
          <InputNumber
            className="hide-number-handle"
            min={0}
            // formatter={value => formatCurrency(value ? value : '0')}
            // parser={value => replaceFormat(value ? value : '0')}
            value={l.price}
            onChange={(e) => console.log(1)}
            onFocus={(e) => e.target.select()}
            style={{ maxWidth: 100, textAlign: "right" }}
          />
        </div>
      );
    },
  };

  const changeItems = (_items: Array<OrderItemModel>) => {
    setItems(_items)
  }

  const DiscountColumnt = {
    title: "Chiết khấu",
    // align: 'center',
    width: 115,
    className: "yody-table-discount text-right",
    render: (l:OrderItemModel, item: any, index: number) => {
      return (
        <div className="site-input-group-wrapper">
          <DiscountGroup
            index={index}
            discountRate={l.discount_items[0].rate}
            discountValue={l.discount_items[0].value}
            totalAmount={0}
            items={items}
            setItems={changeItems}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    className: "yody-table-total-money text-right",
    // width: 100,
    render: (l:OrderItemModel, item: any, index: number) => {
      return <div>{0}</div>;
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
  var timeTextChange: NodeJS.Timeout;
  const [stores, setStore] = useState(false);
  const [isVerify, setVerify] = useState(false);
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [splitLine, setSplitLine] = useState<boolean>(false);

  useLayoutEffect(() => {
    dispatch(getListStoreRequest(setListStores));
  }, [dispatch]);

  const onStoreSelect = useCallback(
    (value: number) => {
      dispatch(validateStoreAction(value, setVerify));
    },
    [dispatch]
  );

  const [listStores, setListStores] = useState<Array<StoreModel>>([]);
  const [keysearch, setKeysearch] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<VariantModel>>([]);
  const autoCompleteRef = createRef<RefSelectProps>();

  const createItem = (variant: VariantModel) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem:OrderItemDiscountModel  = createNewDiscountItem()
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

  const onSearchSelect = useCallback(
    (v, o) => {
      console.log(o);
      let _items = [...items];
        let indexSearch = resultSearch.findIndex(s => s.id == v)
        let index = _items.findIndex(i => i.variant_id == v)
        let r:VariantModel=resultSearch[indexSearch]
        if(r.id == v){
          if(splitLine || index == -1){
            const item:OrderItemModel = createItem(r);
            _items.push(item);
            setSplitLine(false)
          }
          else{
            let lastIndex = index;
            _items.forEach( (value, _index) => {
              if(_index > lastIndex){
                lastIndex = _index;
              }
            })
            _items[lastIndex].quantity += 1
          }
        }
      setItems(_items);
    },
    [resultSearch, items, splitLine]
    // autoCompleteRef, dispatch, resultSearch
  );

  const onChangeSearch = useCallback(
    (v) => {
      setKeysearch(v);
      timeTextChange && clearTimeout(timeTextChange);
      timeTextChange = setTimeout(() => {
        dispatch(OnSearchChange(v, setResultSearch));
      }, 500);
    },
    [dispatch]
  );

  const convertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.forEach((item: VariantModel, index: number) => {
      options.push({
        label: renderSearch(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearch]);

  useLayoutEffect(() => {
    dispatch(getListStoreRequest(setListStores));
  }, [dispatch]);

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreModel> = [];
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
              <Select defaultValue="1" style={{ minWidth: 130 }}>
                <Select.Option value="1">Giá bán lẻ</Select.Option>
                <Select.Option value="2">Giá bán buôn</Select.Option>
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
            <label htmlFor="" className="">
              Cửa hàng
            </label>
            <Select
              className="select-with-search"
              showSearch
              style={{ width: "100%" }}
              placeholder=""
              defaultValue=""
            >
              <Select.Option value="">Chọn cửa hàng</Select.Option>
              {dataCanAccess.map((item, index) => (
                <Select.Option key={index} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
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
                onSelect={onSearchSelect}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeSearch}
                options={convertResultSearch}
              >
                <Input
                  size="middle"
                  className="yody-search"
                  placeholder="Tìm sản phẩm theo tên/ SKU/ Mã vạch (F3)"
                  prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                />
              </AutoComplete>
            </div>
          </div>
        </Col>
      </Row>

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
          dataSource={items}
          className="sale-product-box-table w-100"
          tableLayout="auto"
          // pagination={false}
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
            <div className="font-weight-500 payment-row-money">690.900</div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link className="font-weight-500">
                Chiết khấu
              </Typography.Link>
              <div className="badge-style badge-danger">
                10%{" "}
                <Button type="text" className="p-0">
                  x
                </Button>
              </div>
            </Space>
            <div className="font-weight-500 ">69.090</div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link className="font-weight-500">
                Mã giảm giá
              </Typography.Link>
              <div className="badge-style badge-primary">
                SN50{" "}
                <Button type="text" className="p-0">
                  x
                </Button>
              </div>
            </Space>
            <div className="font-weight-500 ">41.810</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Phí ship báo khách</div>
            <div className="font-weight-500 payment-row-money">20.000</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Khách cần trả</div>
            <div className="font-weight-500 payment-row-money">
              <Typography.Text type="success" className="font-weight-500">
                600.000
              </Typography.Text>
            </div>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductCard;
