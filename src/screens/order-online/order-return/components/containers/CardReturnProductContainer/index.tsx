import { CheckboxChangeEvent } from "antd/lib/checkbox";
import imgDefault from "assets/icon/img-default.svg";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatCurrency } from "utils/AppUtils";
import CardReturnProducts from "../../CardReturnProducts";

type PropType = {
  isExchange?: boolean;
  OrderDetail: OrderResponse | null;
  listOrderProducts?: OrderLineItemResponse[];
  listReturnProducts: ReturnProductModel[];
  handleReturnProducts?: (listReturnProducts: ReturnProductModel[]) => void;
  handleCanReturn?: (value: boolean) => void;
  isDetailPage?: boolean;
  isStepExchange?: boolean;
  discountRate?: number;
  setTotalAmountReturnProducts?: (value: number) => void;
};

function CardReturnProductContainer(props: PropType) {
  const {
    isExchange = false,
    OrderDetail,
    handleReturnProducts,
    listOrderProducts,
    handleCanReturn,
    isDetailPage,
    isStepExchange,
    discountRate,
    setTotalAmountReturnProducts,
  } = props;

  console.log("isStepExchange", isStepExchange);

  const createOrderReturnContext = useContext(CreateOrderReturnContext);
  console.log("createOrderReturnContext", createOrderReturnContext);

  const pointPaymentMethod = "Tiêu điểm";

  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const [isCheckReturnAll, setIsCheckReturnAll] = useState(false);

  const listReturnProducts = createOrderReturnContext?.listReturnProducts;

  const onSelectSearchedVariant = (value: string) => {
    if (!listOrderProducts) {
      return;
    }
    if (!listReturnProducts) {
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
    setSearchVariantInputValue("");
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
    let listOrderProductsResult = listOrderProducts;
    if (searchVariantInputValue) {
      listOrderProductsResult = listOrderProducts.filter((single) => {
        return single.product
          .toLowerCase()
          .includes(searchVariantInputValue.toLowerCase());
      });
    }
    listOrderProductsResult.forEach(
      (item: OrderLineItemResponse, index: number) => {
        options.push({
          label: renderSearchVariant(item),
          value: item.id ? item.id.toString() : "",
        });
      }
    );

    return options;
  }, [listOrderProducts, searchVariantInputValue]);

  const onChangeProductSearchValue = (value: string) => {
    setSearchVariantInputValue(value);
  };

  const onChangeProductQuantity = (value: number | null, index: number) => {
    if (!listReturnProducts) {
      return;
    }
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
  };

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

  const pointAmountUsing = useMemo(() => {
    let result = 0;
    let paymentPointArray = OrderDetail?.payments?.filter((single) => {
      return single.payment_method === pointPaymentMethod;
    });
    if (paymentPointArray) {
      paymentPointArray.forEach((single) => {
        result += single.paid_amount;
      });
    }
    return result;
  }, [OrderDetail]);

  const pointUsing = useMemo(() => {
    let result = 0;
    let paymentPointArray = OrderDetail?.payments?.filter((single) => {
      return single.payment_method === pointPaymentMethod;
    });
    if (paymentPointArray) {
      paymentPointArray.forEach((single) => {
        if (single.point) {
          result += single.point;
        }
      });
    }
    return result;
  }, [OrderDetail]);

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
      if (totalPrice > pointAmountUsing) {
        totalPrice = totalPrice - pointAmountUsing;
      }
      return totalPrice;
    },
    [pointAmountUsing, getProductDiscountPerOrder]
  );

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

  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    if (setTotalAmountReturnProducts) {
      setTotalAmountReturnProducts(getTotalPrice(listReturnProducts));
    }
  }, [getTotalPrice, listReturnProducts, setTotalAmountReturnProducts]);

  return (
    <CardReturnProducts
      OrderDetail={OrderDetail}
      convertResultSearchVariant={convertResultSearchVariant}
      handleChangeReturnAll={handleChangeReturnAll}
      isExchange={isExchange}
      isStepExchange={isStepExchange}
      isCheckReturnAll={isCheckReturnAll}
      listReturnProducts={listReturnProducts}
      onChangeProductQuantity={onChangeProductQuantity}
      onChangeProductSearchValue={onChangeProductSearchValue}
      onSelectSearchedVariant={onSelectSearchedVariant}
      pointAmountUsing={pointAmountUsing}
      pointUsing={pointUsing}
      searchVariantInputValue={searchVariantInputValue}
      totalPriceReturnToCustomer={
        listReturnProducts ? Math.round(getTotalPrice(listReturnProducts)) : 0
      }
      isShowProductSearch={isShowProductSearch()}
    />
  );
}

export default CardReturnProductContainer;
