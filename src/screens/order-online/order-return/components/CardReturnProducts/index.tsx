import { SearchOutlined } from "@ant-design/icons";
import {
	AutoComplete,
	Button,
	Card,
	Checkbox,
	Col,
	Input,
	Popover,
	Row,
	Table,
	Tooltip
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { OrderLineItemRequest } from "model/request/order.request";
import { OrderResponse, ReturnProductModel } from "model/response/order/order.response";
import React, { createRef, useContext, useState } from "react";
import { Link } from "react-router-dom";
import StoreReturnModel from "screens/order-online/modal/store-return.modal";
import { formatCurrency, getProductDiscountPerOrder, getProductDiscountPerProduct, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  isDetailPage?: boolean;
  isExchange?: boolean;
  isStepExchange?: boolean;
  isShowProductSearch?: boolean;
  OrderDetail?: OrderResponse | null;
  listReturnProducts?: ReturnProductModel[];
  searchVariantInputValue?: string;
  pointUsing?: number;
  totalAmountReturnProducts: number | undefined;
  isCheckReturnAll?: boolean;
  convertResultSearchVariant?: any[] | undefined;
  onChangeProductSearchValue?: (value: string) => void;
  onSelectSearchedVariant?: (value: string) => void;
  onChangeProductQuantity?: (value: number | null, index: number) => void;
  handleChangeReturnAll?: (e: CheckboxChangeEvent) => void;
};

function CardReturnProducts(props: PropType) {
  const {
    isDetailPage = false,
    isExchange = false,
    isStepExchange = false,
    isShowProductSearch = false,
    OrderDetail,
    listReturnProducts,
    pointUsing,
    searchVariantInputValue,
    convertResultSearchVariant,
    totalAmountReturnProducts = 0,
    isCheckReturnAll,
    onChangeProductSearchValue,
    onSelectSearchedVariant,
    onChangeProductQuantity,
    handleChangeReturnAll,
  } = props;

  console.log("totalAmountReturnProducts", totalAmountReturnProducts);

  const autoCompleteRef = createRef<RefSelectProps>();

  const createOrderReturnContext = useContext(CreateOrderReturnContext);
  const storeReturn= createOrderReturnContext?.return.storeReturn;

  const [isStoreReturnModalVisible,setStoreReturnModalVisible]=useState(false);

  // const discountRate = useMemo(() => {
  //   if (OrderDetail && OrderDetail.discounts) {
  //     let discountRate = 0;
  //     OrderDetail.discounts.forEach((single) => {
  //       const singleDiscountRate = single.rate || 0;
  //       discountRate += singleDiscountRate;
  //     });
  //     return discountRate;
  //   } else {
  //     return 0;
  //   }
  // }, [OrderDetail]);

  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Checkbox
          style={{marginLeft: 20}}
          onChange={handleChangeReturnAll}
          checked={isCheckReturnAll}
        >
          Trả toàn bộ sản phẩm
        </Checkbox>
        <Button onClick={() => {setStoreReturnModalVisible(true)}} style={{marginLeft: 20}}>Chọn cửa hàng</Button>
      </React.Fragment>
    );
  };

  const renderPopOverPriceTitle = (price: number) => {
    return (
      <div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p style={{margin: 0}}>Đơn giá gốc: </p>
          <p style={{margin: "0 0 0 20px"}}>{price}</p>
        </div>
      </div>
    );
  };

  const renderPopOverPriceContent = (
    discountPerProduct: number,
    discountPerOrder: number
  ) => {
    return (
      <div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p>Chiết khấu/sản phẩm: </p>
          <p style={{marginLeft: 20}}>{formatCurrency(discountPerProduct)}</p>
        </div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p style={{marginBottom: 0}}>Chiết khấu/đơn hàng: </p>
          <p style={{marginLeft: 20, marginBottom: 0}}>{formatCurrency(discountPerOrder)}</p>
        </div>
      </div>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
      render: (value, record: ReturnProductModel, index: number) => {
        return (
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
                  to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={record.variant} className="yody-pos-varian-name">
                  <span>{record.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: () => (
        <div className="text-center">
          <div style={{textAlign: "center"}}>Số lượng trả</div>
        </div>
      ),
      className: "columnQuantity",
      render: (value, record: ReturnProductModel, index: number) => {
        if (isDetailPage) {
          return record.quantity;
        } else {
          if (isExchange && isStepExchange) {
            return record.quantity;
          }
          return (
            <div>
              <NumberInput
                min={0}
                max={record.maxQuantityCanBeReturned}
                value={record.quantity}
                // defaultValue={0}
                onChange={(value: number | null) => {
                  if (onChangeProductQuantity) {
                    onChangeProductQuantity(value, index);
                  }
                }}
                className="hide-number-handle"
                maxLength={4}
                minLength={0}
                style={{width: 100}}
              />{" "}
              / {record.maxQuantityCanBeReturned}
            </div>
          );
        }
      },
    },
    {
      title: () => (
        <div>
          <span style={{color: "#222222", textAlign: "right"}}>Đơn giá sau giảm giá</span>
          <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
        </div>
      ),
      dataIndex: "price",
      key: "price",
      render: (value: number, record: ReturnProductModel, index: number) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        const pricePerOrder = record.price - discountPerProduct - discountPerOrder;
        return (
          <Popover
            content={renderPopOverPriceContent(discountPerProduct, discountPerOrder)}
            title={renderPopOverPriceTitle(record.price)}
          >
            {formatCurrency(pricePerOrder)}
          </Popover>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{color: "#222222"}}>Tổng tiền</span>
          <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
        </div>
      ),
      key: "total",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(
              Math.round(value.price - discountPerProduct - discountPerOrder) *
                value.quantity
            )}
          </div>
        );
      },
    },
  ];

  const handleCancelStoreReturn=()=>{
    setStoreReturnModalVisible(false);
  }

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title={isStepExchange ? "Thông tin sản phẩm trả" : "SẢN PHẨM"}
        extra={!isDetailPage && !isStepExchange ? renderCardExtra() : null}
      >
        {isShowProductSearch && (
          <div>
            <div className="label">Sản phẩm:</div>
            <AutoComplete
              notFoundContent={
                searchVariantInputValue
                  ? searchVariantInputValue.length >= 0
                    ? "Không tìm thấy sản phẩm"
                    : undefined
                  : undefined
              }
              id="search_product"
              value={searchVariantInputValue}
              ref={autoCompleteRef}
              onSelect={onSelectSearchedVariant}
              dropdownClassName="search-layout dropdown-search-header"
              dropdownMatchSelectWidth={456}
              className="productSearchInput"
              onSearch={onChangeProductSearchValue}
              options={convertResultSearchVariant}
              maxLength={255}
              dropdownRender={(menu) => <div>{menu}</div>}
            >
              <Input
                size="middle"
                className="yody-search"
                placeholder="Chọn sản phẩm"
                prefix={<SearchOutlined style={{color: "#ABB4BD"}} />}
              />
            </AutoComplete>
          </div>
        )}
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm đổi trả!</p>
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
          rowKey={(record: any) => record.id}
          columns={columns}
          dataSource={listReturnProducts}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          scroll={{y: 300}}
          sticky
        />
        <Row className="boxPayment" gutter={24}>
          <Col xs={24} lg={11}></Col>
          <Col xs={24} lg={10}>
            <Row className="payment-row" justify="space-between">
              <span className="font-size-text">Số lượng:</span>
              <span>
                {listReturnProducts && (
                  <span>{getTotalQuantity(listReturnProducts)}</span>
                )}
              </span>
            </Row>
            <Row className="payment-row" justify="space-between">
              {isDetailPage ? (
                <React.Fragment>
                  <span className="font-size-text">Điểm hoàn: </span>
                  <span>{` ${pointUsing ? pointUsing : 0} điểm`}</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="font-size-text">Điểm hoàn:</span>
                  <span>{` ${pointUsing ? pointUsing : 0} điểm`}</span>
                </React.Fragment>
              )}
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền trả khách:</strong>
              <strong>
                {formatCurrency(totalAmountReturnProducts)}
              </strong>
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Trả tại cửa hàng:</strong>
              <strong>
                {storeReturn?.name}
              </strong>
            </Row>
          </Col>
        </Row>
      </Card>
      <StoreReturnModel
         isModalVisible={isStoreReturnModalVisible}
         setModalVisible={setStoreReturnModalVisible}
         handleCancel={handleCancelStoreReturn}
      />
    </StyledComponent>
  );
}

export default CardReturnProducts;
