import { CheckboxChangeEvent } from "antd/lib/checkbox";
import imgDefault from "assets/icon/img-default.svg";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { actionGetOrderReturnCalculateRefund } from "domain/actions/order/order-return.action";
import { OrderReturnCalculateRefundRequestModel } from "model/request/order.request";
import {
	OrderLineItemResponse,
	OrderResponse,
	ReturnProductModel
} from "model/response/order/order.response";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
	formatCurrency,
	getLineAmountAfterLineDiscount,
	getLineItemDiscountAmount,
	getLineItemDiscountRate,
	getLineItemDiscountValue,
	getProductDiscountPerOrder,
	getProductDiscountPerProduct
} from "utils/AppUtils";
import CardReturnProducts from "../../CardReturnProducts";

type PropType = {
  isDetailPage?: boolean;
  discountRate?: number;
  orderId: number | undefined;
  handleCanReturn?: (value: boolean) => void;
};

function CardReturnProductContainer(props: PropType) {
  const {handleCanReturn, isDetailPage, orderId} = props;

  const dispatch = useDispatch();

  const pointPaymentMethodId = 1;

  const createOrderReturnContext = useContext(CreateOrderReturnContext);

  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const [isCheckReturnAll, setIsCheckReturnAll] = useState(false);
  const [pointRefund, setPointRefund] = useState(0);

  const listReturnProducts = createOrderReturnContext?.return.listReturnProducts;
  const listItemCanBeReturn = createOrderReturnContext?.return.listItemCanBeReturn;
  const setListReturnProducts = createOrderReturnContext?.return.setListReturnProducts;
  const setTotalAmountReturnProducts =
    createOrderReturnContext?.return.setTotalAmountReturnProducts;
  const totalAmountReturnProducts =
    createOrderReturnContext?.return.totalAmountReturnProducts;
  const moneyRefund = createOrderReturnContext?.return.moneyRefund;
  const setMoneyRefund = createOrderReturnContext?.return.setMoneyRefund;
  const OrderDetail = createOrderReturnContext?.orderDetail;
  // const listOrderProducts = OrderDetail?.items;
  const isStepExchange = createOrderReturnContext?.isStepExchange;
  const isExchange = createOrderReturnContext?.isExchange;

  const onSelectSearchedVariant = (value: string) => {
    if (!listItemCanBeReturn) {
      return;
    }
    if (!listReturnProducts) {
      return;
    }
    const selectedVariant = listItemCanBeReturn.find((single) => {
      return single.id === +value;
    });
    if (!selectedVariant) return;
    let selectedVariantWithMaxQuantity: ReturnProductModel = {
      ...selectedVariant,
      maxQuantityCanBeReturned: selectedVariant.quantity,
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
        selectedVariant.maxQuantityCanBeReturned &&
        selectedVariant.quantity < selectedVariant.maxQuantityCanBeReturned
      ) {
        selectedVariant.quantity += 1;
      }
    }
    if (setListReturnProducts) {
      setListReturnProducts(result);
    }
    if (handleCanReturn) {
      handleCanReturn(true);
    }
    if (
      result.some((single) => {
        return (
          single.maxQuantityCanBeReturned &&
          single.quantity < single.maxQuantityCanBeReturned
        );
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
    if (!listItemCanBeReturn) {
      return;
    }
    if (e.target.checked) {
      const resultReturnProducts: ReturnProductModel[] = listItemCanBeReturn.map(
        (single) => {
          return {
            ...single,
            maxQuantityCanBeReturned: single.quantity,
          };
        }
      );
      if (setListReturnProducts) {
        setListReturnProducts(resultReturnProducts);
      }
      checkIfIsCanReturn(resultReturnProducts);
    } else {
      const result: ReturnProductModel[] = listItemCanBeReturn.map((single) => {
        return {
          ...single,
          quantity: 0,
          maxQuantityCanBeReturned: single.quantity,
        };
      });
      if (setListReturnProducts) {
        setListReturnProducts(result);
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
        style={{padding: "3px 20px", alignItems: "center"}}
      >
        <div className="rs-left w-100" style={{width: "100%"}}>
          <div style={{marginTop: 10}}>
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{width: "40px", height: "40px", borderRadius: 5}}
            />
          </div>
          <div className="rs-info w-100">
            <span style={{color: "#37394D"}} className="text">
              {item.product}
            </span>
            <span style={{color: "#95A1AC"}} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right">
          <span style={{color: "#222222"}} className="text t-right">
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
    if (!listItemCanBeReturn) {
      return;
    }
    let options: any[] = [];
    let listOrderProductsResult = listItemCanBeReturn;
    if (searchVariantInputValue) {
      listOrderProductsResult = listItemCanBeReturn.filter((single) => {
        return single.product
          .toLowerCase()
          .includes(searchVariantInputValue.toLowerCase()) || 
          single.sku
          .toLowerCase()
          .includes(searchVariantInputValue.toLowerCase());
      });
    }
    listOrderProductsResult.forEach((item: OrderLineItemResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });

    return options;
  }, [listItemCanBeReturn, searchVariantInputValue]);

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
    if (value) {
			resultListReturnProducts[index].amount = resultListReturnProducts[index].price * value;
      resultListReturnProducts[index].discount_items = listReturnProducts[
        index
      ].discount_items.map((discount) => {
        return {
          ...discount,
          amount: value * discount.value,
        };
      });
      resultListReturnProducts[index].discount_value = getLineItemDiscountValue(
        resultListReturnProducts[index]
      );
      resultListReturnProducts[index].discount_rate = getLineItemDiscountRate(
        resultListReturnProducts[index]
      );
      resultListReturnProducts[index].discount_amount = getLineItemDiscountAmount(
        resultListReturnProducts[index]
      );
      resultListReturnProducts[index].line_amount_after_line_discount =
        getLineAmountAfterLineDiscount(resultListReturnProducts[index]);
    }
    if (setListReturnProducts) {
      setListReturnProducts(resultListReturnProducts);
    }
    if (
      resultListReturnProducts.some((single) => {
        return (
          single.maxQuantityCanBeReturned &&
          single.quantity < single.maxQuantityCanBeReturned
        );
      })
    ) {
      setIsCheckReturnAll(false);
    } else {
      setIsCheckReturnAll(true);
    }
    checkIfIsCanReturn(resultListReturnProducts);
  };

  // const pointAmountUsing = useMemo(() => {
  //   let result = 0;
  //   let paymentPointArray = OrderDetail?.payments?.filter((single) => {
  //     return single.payment_method === pointPaymentMethodId;
  //   });
  //   if (paymentPointArray) {
  //     paymentPointArray.forEach((single) => {
  //       result += single.paid_amount;
  //     });
  //   }
  //   return result;
  // }, [OrderDetail]);

  // const pointUsing = useMemo(() => {
  //   let result = 0;
  //   let paymentPointArray = OrderDetail?.payments?.filter((single) => {
  //     return single.payment_method === pointPaymentMethodId;
  //   });
  //   if (paymentPointArray) {
  //     paymentPointArray.forEach((single) => {
  //       if (single.point) {
  //         result += single.point;
  //       }
  //     });
  //   }
  //   return result;
  // }, [OrderDetail]);

  const getTotalPrice = useCallback(
    (listReturnProducts: ReturnProductModel[]) => {
      let totalPrice = 0;
      listReturnProducts.forEach((single) => {
        let discountPerProduct = getProductDiscountPerProduct(single);
        let discountPerOrder = getProductDiscountPerOrder(OrderDetail, single);
        let singleTotalPrice = single.price - discountPerProduct - discountPerOrder;
        totalPrice = totalPrice + single.quantity * singleTotalPrice;
      });
      return totalPrice;
    },
    [OrderDetail]
  );

  const isShowProductSearch = () => {
    let result = true;
    if (isDetailPage || isStepExchange) {
      result = false;
    }
    return result;
  };

  // const totalPriceReturnToCustomer = useMemo(() => {
  //   let result = listReturnProducts
  //     ? Math.round(getTotalPrice(listReturnProducts))
  //     : 0;
  //   let isUsingPoint = OrderDetail?.payments?.some((single) => {
  //     return single.payment_method_id === 1;
  //   });
  //   const refund = listReturnProducts ? getTotalPrice(listReturnProducts) : 0;
  //   if (isUsingPoint) {
  //     if (OrderDetail?.customer_id && orderId && refund > 0) {
  //       dispatch(
  //         actionGetOrderReturnCalculateRefund(
  //           OrderDetail.customer_id,
  //           orderId,
  //           refund,
  //           (response) => {
  //           }
  //         )
  //       );
  //     }
  //   }
  //   return result;
  // }, [OrderDetail, dispatch, getTotalPrice, listReturnProducts, orderId]);

  /**
   * tính toán refund khi tiêu điểm
   */
  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    let isUsingPoint = OrderDetail?.payments?.some((single) => {
      return single.payment_method_id === pointPaymentMethodId;
    });
    const refund_money = listReturnProducts ? getTotalPrice(listReturnProducts) : 0;
    if (isUsingPoint) {
      if (OrderDetail?.customer_id && orderId && refund_money > 0) {
        const listReturnProductsResult = listReturnProducts.filter(item => {
          return item.quantity > 0
        });
        const returnItems = listReturnProductsResult.map(item => {
          const {maxQuantityCanBeReturned, ...rest} = item;
          return rest;
        });
        const returnItemsNow: OrderResponse[] = [
          {
            ...OrderDetail,
            items: returnItems
          }
        ]
        let return_items = [...returnItemsNow]
        if(OrderDetail.order_returns) {
          return_items= [...returnItemsNow, ...OrderDetail.order_returns]
        }
        let params: OrderReturnCalculateRefundRequestModel = {
          customerId: OrderDetail.customer_id,
          items: OrderDetail.items,
          orderId,
          refund_money,
          return_items
        }
        dispatch(
          actionGetOrderReturnCalculateRefund(
            params,
            (response) => {
              setPointRefund(response.point_refund);
              if (setMoneyRefund) {
                setMoneyRefund(response.money_refund);
              }
            }
          )
        );
      } else {
        setPointRefund(0);
        if (setMoneyRefund) {
          setMoneyRefund(0);
        }
      }
    }
  }, [OrderDetail, OrderDetail?.customer_id, OrderDetail?.items, OrderDetail?.payments, dispatch, getTotalPrice, listReturnProducts, orderId, setMoneyRefund]);

  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    let result = 0;
    let isUsingPoint = OrderDetail?.payments?.some((single) => {
      return single.payment_method_id === pointPaymentMethodId;
    });
    if (!isUsingPoint) {
      if (setTotalAmountReturnProducts) {
        result = getTotalPrice(listReturnProducts);
      }
    } else {
      if (moneyRefund) {
        result = moneyRefund;
      }
    }

    if (setTotalAmountReturnProducts) {
      setTotalAmountReturnProducts(result);
    }
  }, [
    OrderDetail?.payments,
    getTotalPrice,
    listReturnProducts,
    moneyRefund,
    setTotalAmountReturnProducts,
  ]);

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
      pointUsing={pointRefund}
      searchVariantInputValue={searchVariantInputValue}
      totalAmountReturnProducts={totalAmountReturnProducts}
      isShowProductSearch={isShowProductSearch()}
    />
  );
}

export default CardReturnProductContainer;
