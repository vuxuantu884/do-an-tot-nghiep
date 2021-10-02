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
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefault from "assets/icon/img-default.svg";
import NumberInput from "component/custom/number-input.custom";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  OrderLineItemResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listOrderProducts?: OrderLineItemResponse[];
  listReturnProducts: ReturnProductModel[];
  handleReturnProducts?: (listReturnProducts: ReturnProductModel[]) => void;
  handleCanReturn?: (value: boolean) => void;
  isDetailPage?: boolean;
  isExchange?: boolean;
  isStepExchange?: boolean;
  discountRate?: number;
  setTotalAmountReturnProducts?: (value: number) => void;
};

function CardReturnProducts(props: PropType) {
  const {
    listReturnProducts,
    handleReturnProducts,
    listOrderProducts,
    handleCanReturn,
    isDetailPage,
    isExchange,
    isStepExchange,
    discountRate,
    setTotalAmountReturnProducts,
  } = props;
  console.log("isStepExchange", isStepExchange);
  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const [isCheckReturnAll, setIsCheckReturnAll] = useState(false);
  const autoCompleteRef = createRef<RefSelectProps>();

  const onSelectSearchedVariant = (value: string) => {
    if (!listOrderProducts) {
      return;
    }
    const selectedVariant = listOrderProducts.find((single) => {
      return single.id === +value;
    });
    if (!selectedVariant) return;
    let selectedVariantWithMaxQuantity: ReturnProductModel = {
      ...selectedVariant,
      maxQuantity: selectedVariant.quantity,
    };
    let indexSelectedVariant = listReturnProducts.findIndex((single) => {
      return single.id === selectedVariantWithMaxQuantity.id;
    });
    let result = [...listReturnProducts];
    if (indexSelectedVariant === -1) {
      selectedVariantWithMaxQuantity.quantity = 1;
      result = [selectedVariantWithMaxQuantity, ...listReturnProducts];
    } else {
      let selectedVariant = result[indexSelectedVariant];
      if (
        selectedVariant.maxQuantity &&
        selectedVariant.quantity < selectedVariant.maxQuantity
      ) {
        selectedVariant.quantity += 1;
      }
    }
    if (handleReturnProducts) {
      handleReturnProducts(result);
    }
    if (handleCanReturn) {
      handleCanReturn(true);
    }
    if (
      result.some((single) => {
        return single.maxQuantity && single.quantity < single.maxQuantity;
      })
    ) {
      setIsCheckReturnAll(false);
    } else {
      setIsCheckReturnAll(true);
    }
  };

  const checkIfIsCanReturn = (listReturnProducts: ReturnProductModel[]) => {
    if (handleCanReturn) {
      if (
        listReturnProducts.some((single) => {
          return single.quantity > 0;
        })
      ) {
        handleCanReturn(true);
      } else {
        handleCanReturn(false);
      }
    }
  };

  const handleChangeReturnAll = (e: CheckboxChangeEvent) => {
    if (!listOrderProducts) {
      return;
    }
    if (e.target.checked) {
      const resultReturnProducts: ReturnProductModel[] = listOrderProducts.map(
        (single) => {
          return {
            ...single,
            maxQuantity: single.quantity,
          };
        }
      );
      if (handleReturnProducts) {
        handleReturnProducts(resultReturnProducts);
      }
      checkIfIsCanReturn(resultReturnProducts);
      // if (setTotalAmountReturnProducts) {
      //   setTotalAmountReturnProducts(getTotalPrice(resultReturnProducts));
      // }
    } else {
      const result: ReturnProductModel[] = listOrderProducts.map((single) => {
        return {
          ...single,
          quantity: 0,
          maxQuantity: single.quantity,
        };
      });
      if (handleReturnProducts) {
        handleReturnProducts(result);
      }
      checkIfIsCanReturn(result);
      // if (setTotalAmountReturnProducts) {
      //   setTotalAmountReturnProducts(0);
      // }
    }
    setIsCheckReturnAll(e.target.checked);
  };

  const renderSearchVariant = (item: OrderLineItemResponse) => {
    let avatar = item.variant_image;
    return (
      <div
        className="row-search w-100"
        style={{ padding: "3px 20px", alignItems: "center" }}
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
              {item.product}
            </span>
            <span style={{ color: "#95A1AC" }} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right">
          <span style={{ color: "#222222" }} className="text t-right">
            {formatCurrency(item.price)}
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
        </div>
      </div>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    if (!listOrderProducts) {
      return;
    }
    let options: any[] = [];
    listOrderProducts.forEach((item: OrderLineItemResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [listOrderProducts]);

  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Checkbox
          style={{ marginLeft: 20 }}
          onChange={handleChangeReturnAll}
          checked={isCheckReturnAll}
        >
          Trả toàn bộ sản phẩm
        </Checkbox>
      </React.Fragment>
    );
  };

  const onChangeProductSearchValue = (value: string) => {
    setSearchVariantInputValue(value);
  };

  const onChangeProductQuantity = (value: number | null, index: number) => {
    let resultListReturnProducts = [...listReturnProducts];
    resultListReturnProducts[index].quantity = Number(
      value === null ? "0" : value.toString().replace(".", "")
    );
    if (handleReturnProducts) {
      handleReturnProducts(resultListReturnProducts);
    }
    if (
      resultListReturnProducts.some((single) => {
        return single.maxQuantity && single.quantity < single.maxQuantity;
      })
    ) {
      setIsCheckReturnAll(false);
    } else {
      setIsCheckReturnAll(true);
    }
    checkIfIsCanReturn(resultListReturnProducts);
    // if (setTotalAmountReturnProducts) {
    //   setTotalAmountReturnProducts(getTotalPrice(listReturnProducts));
    // }
  };

  // const getTotalPrice = (listReturnProducts: ReturnProductModel[]) => {
  //   let totalPrice = 0;
  //   listReturnProducts.forEach((single) => {
  //     let discountPerProduct = getProductDiscountPerProduct(single);
  //     let discountPerOrder = getProductDiscountPerOrder(single);
  //     let singleTotalPrice =
  //       single.price - discountPerProduct - discountPerOrder;
  //     totalPrice = totalPrice + single.quantity * singleTotalPrice;
  //   });
  //   // setTotalAmountReturnProducts(totalPrice);
  //   return totalPrice;
  // };

  // const getProductDiscountPerOrder = (product: ReturnProductModel) => {
  //   let discountPerOrder = 0;
  //   let discountPerProduct = getProductDiscountPerProduct(product);
  //   if (discountRate) {
  //     discountPerOrder =
  //       ((product.price - discountPerProduct) * discountRate) / 100;
  //   }
  //   return discountPerOrder;
  // };

  const getProductDiscountPerOrder = useCallback(
    (product: ReturnProductModel) => {
      let discountPerOrder = 0;
      let discountPerProduct = getProductDiscountPerProduct(product);
      if (discountRate) {
        discountPerOrder =
          ((product.price - discountPerProduct) * discountRate) / 100;
      }
      return discountPerOrder;
    },
    [discountRate]
  );

  const getTotalPrice = useCallback(
    (listReturnProducts: ReturnProductModel[]) => {
      let totalPrice = 0;
      listReturnProducts.forEach((single) => {
        let discountPerProduct = getProductDiscountPerProduct(single);
        let discountPerOrder = getProductDiscountPerOrder(single);
        let singleTotalPrice =
          single.price - discountPerProduct - discountPerOrder;
        totalPrice = totalPrice + single.quantity * singleTotalPrice;
      });
      // setTotalAmountReturnProducts(totalPrice);
      return totalPrice;
    },
    [getProductDiscountPerOrder]
  );

  // const getTotalPrice =  (listReturnProducts: ReturnProductModel[]) => {

  // };

  const getProductDiscountPerProduct = (product: ReturnProductModel) => {
    let discountPerProduct = 0;
    product.discount_items.forEach((single) => {
      discountPerProduct += single.value;
    });
    return discountPerProduct;
  };

  const isShowProductSearch = () => {
    let result = true;
    if (isDetailPage || isStepExchange) {
      result = false;
    }
    return result;
  };

  const renderPopOverPriceTitle = (price: number) => {
    return (
      <div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p style={{ margin: 0 }}>Đơn giá gốc: </p>
          <p style={{ margin: "0 0 0 20px" }}>{price}</p>
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
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p>Chiết khấu/sản phẩm: </p>
          <p style={{ marginLeft: 20 }}>
            {formatCurrency(Math.round(discountPerProduct))}
          </p>
        </div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p>Chiết khấu/đơn hàng: </p>
          <p style={{ marginLeft: 20 }}>
            {formatCurrency(Math.round(discountPerOrder))}
          </p>
        </div>
      </div>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
    },
    {
      title: () => (
        <div className="text-center">
          <div style={{ textAlign: "center" }}>Số lượng trả</div>
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
                max={record.maxQuantity}
                value={record.quantity}
                // defaultValue={0}
                onChange={(value: number | null) =>
                  onChangeProductQuantity(value, index)
                }
                className="hide-number-handle"
                maxLength={4}
                minLength={0}
                style={{ width: 100 }}
              />{" "}
              / {record.maxQuantity}
            </div>
          );
        }
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222", textAlign: "right" }}>
            Đơn giá sau giảm giá
          </span>
          <span
            style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}
          >
            ₫
          </span>
        </div>
      ),
      dataIndex: "price",
      key: "price",
      render: (value: number, record: ReturnProductModel, index: number) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
        let discountPerOrder = getProductDiscountPerOrder(record);
        return (
          <Popover
            content={renderPopOverPriceContent(
              discountPerProduct,
              discountPerOrder
            )}
            title={renderPopOverPriceTitle(record.price)}
          >
            {formatCurrency(
              Math.round(record.price - discountPerProduct - discountPerOrder)
            )}
          </Popover>
        );
      },
    },
    // {
    //   title: "Chiết khấu",
    //   width: "20%",
    //   render: (value: number, record: ReturnProductModel, index: number) => {
    //     return (
    //       <div>
    //         {record.discount_items[0].value !== null
    //           ? formatCurrency(record.discount_items[0].value)
    //           : 0}
    //       </div>
    //     );
    //   },
    // },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Tổng tiền</span>
          <span
            style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}
          >
            ₫
          </span>
        </div>
      ),
      key: "total",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
        let discountPerOrder = getProductDiscountPerOrder(record);
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

  useEffect(() => {
    if (setTotalAmountReturnProducts) {
      setTotalAmountReturnProducts(getTotalPrice(listReturnProducts));
    }
  }, [getTotalPrice, listReturnProducts, setTotalAmountReturnProducts]);

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        // title="SẢN PHẨM"
        title={isStepExchange ? "Thông tin sản phẩm trả" : "SẢN PHẨM"}
        extra={!isDetailPage && !isStepExchange ? renderCardExtra() : null}
      >
        {isShowProductSearch() && (
          <div>
            <div className="label">Sản phẩm:</div>
            <AutoComplete
              notFoundContent={
                searchVariantInputValue.length >= 0
                  ? "Không tìm thấy sản phẩm"
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
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
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
          scroll={{ y: 300 }}
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
              <strong className="font-size-text">Tổng tiền trả khách:</strong>
              <strong>
                {formatCurrency(Math.round(getTotalPrice(listReturnProducts)))}
              </strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnProducts;
