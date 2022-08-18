import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import imgDefault from "assets/icon/img-default.svg";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { actionGetOrderReturnCalculateRefund } from "domain/actions/order/order-return.action";
import { StoreResponse } from "model/core/store.model";
import { CalculateMoneyRefundRequestModel } from "model/order/return.model";
import { OrderReturnCalculateRefundRequestModel } from "model/request/order.request";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { calculateMoneyRefundService } from "service/order/return.service";
import {
  formatCurrency,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  getProductDiscountPerOrder,
  getProductDiscountPerProduct,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { isOrderDetailHasPointPayment } from "utils/OrderUtils";
import { fullTextSearch } from "utils/StringUtils";
// import { fullTextSearch } from "utils/StringUtils";
import CardReturnProducts from "../../CardReturnProducts";

type PropTypes = {
  autoCompleteRef: React.RefObject<RefSelectProps>;
  discountRate?: number;
  orderId: number | undefined;
  searchVariantInputValue: string;
  handleCanReturn?: (value: boolean) => void;
  setIsVisibleModalWarningPointRefund?: (value: boolean) => void;
  stores: StoreResponse[];
  setSearchVariantInputValue: (value: string) => void;
  setListOrderProductsResult: (value: OrderLineItemResponse[]) => void;
  isAlreadyShowWarningPoint: boolean;
  paymentMethods: PaymentMethodResponse[];
};

function CardReturnProductContainer(props: PropTypes) {
  const {
    handleCanReturn,
    orderId,
    setIsVisibleModalWarningPointRefund,
    autoCompleteRef,
    searchVariantInputValue,
    setSearchVariantInputValue,
    setListOrderProductsResult,
    stores,
    isAlreadyShowWarningPoint,
    paymentMethods,
  } = props;

  const dispatch = useDispatch();

  const createOrderReturnContext = useContext(CreateOrderReturnContext);

  const [isCheckReturnAll, setIsCheckReturnAll] = useState(true);

  const listReturnProducts = createOrderReturnContext?.return.listReturnProducts;
  const listItemCanBeReturn = createOrderReturnContext?.return.listItemCanBeReturn;
  const listOrderProductsResult = createOrderReturnContext?.return.listOrderProductsResult;
  const setListReturnProducts = createOrderReturnContext?.return.setListReturnProducts;
  const setTotalAmountReturnProducts =
    createOrderReturnContext?.return.setTotalAmountReturnProducts;
  const totalAmountReturnProducts = createOrderReturnContext?.return.totalAmountReturnProducts;
  const refund = createOrderReturnContext?.return.refund;
  const setRefund = createOrderReturnContext?.return.setRefund;
  const OrderDetail = createOrderReturnContext?.orderDetail;
  // const listOrderProducts = OrderDetail?.items;
  const isExchange = createOrderReturnContext?.isExchange;

  const onSelectSearchedVariant = (value: string) => {
    if (!listItemCanBeReturn) {
      return;
    }
    if (!listReturnProducts) {
      return;
    }
    const selectedVariant = listItemCanBeReturn.find((single) => {
      return single.variant_id === +value;
    });
    if (!selectedVariant) return;
    let selectedVariantWithMaxQuantity: ReturnProductModel = {
      ...selectedVariant,
      maxQuantityCanBeReturned: selectedVariant.quantity,
    };
    let indexSelectedVariant = listReturnProducts.findIndex((single) => {
      return single.variant_id === selectedVariantWithMaxQuantity.variant_id;
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
        return single.maxQuantityCanBeReturned && single.quantity < single.maxQuantityCanBeReturned;
      })
    ) {
      setIsCheckReturnAll(false);
    } else {
      setIsCheckReturnAll(true);
    }
    //setSearchVariantInputValue("");
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
      const resultReturnProducts: ReturnProductModel[] = listItemCanBeReturn.map((single) => {
        return {
          ...single,
          maxQuantityCanBeReturned: single.quantity,
          amount: single.quantity * single.price,
          line_amount_after_line_discount: single.quantity * (single.price - single.discount_value),
        };
      });
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

  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    if (
      listReturnProducts.some((single) => single.maxQuantityCanBeReturned > single.quantity) ||
      listReturnProducts.length !== listItemCanBeReturn?.length
    ) {
      setIsCheckReturnAll(false);
    } else {
      setIsCheckReturnAll(true);
    }
  }, [listItemCanBeReturn?.length, listReturnProducts]);

  const renderSearchVariant = (item: OrderLineItemResponse) => {
    let avatar = item.variant_image;
    return (
      <div className="row-search w-100" style={{ padding: "3px 20px", alignItems: "center" }}>
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
              {item.variant}
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
    if (!listItemCanBeReturn) return [];
    if (!listOrderProductsResult) return [];
    let options: any[] = [];

    // let listOrderProductsResult = listItemCanBeReturn;
    // if (searchVariantInputValue) {
    //   listOrderProductsResult = listItemCanBeReturn.filter((single) => {
    //     return (
    //       fullTextSearch(searchVariantInputValue, single.variant) ||
    //       fullTextSearch(searchVariantInputValue, single.sku)
    //     );
    //   });
    // }
    listOrderProductsResult?.forEach((item: OrderLineItemResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.variant_id ? item.variant_id.toString() : "",
      });
    });

    return options;
  }, [listItemCanBeReturn, listOrderProductsResult]);

  const onChangeProductSearchValue = (value: string) => {
    setSearchVariantInputValue(value);
    let result =
      listItemCanBeReturn?.filter((single) => {
        return (
          fullTextSearch(searchVariantInputValue, single.variant) ||
          fullTextSearch(searchVariantInputValue, single.sku) ||
          fullTextSearch(searchVariantInputValue, single.variant_barcode)
        );
      }) || [];

    // console.log(result)

    setListOrderProductsResult(result);
  };

  const onChangeProductQuantity = (value: number | null, index: number) => {
    if (!listReturnProducts || !orderId) {
      return;
    }
    let resultListReturnProducts = [...listReturnProducts];
    resultListReturnProducts[index].quantity = Number(
      // value === null ? "0" : value.toString().replace(".", "")
      value ? value : 0,
    );
    if (value) {
      resultListReturnProducts[index].amount = resultListReturnProducts[index].price * value;
      resultListReturnProducts[index].discount_items = listReturnProducts[index].discount_items.map(
        (discount) => {
          return {
            ...discount,
            amount: value * discount.value,
          };
        },
      );
      resultListReturnProducts[index].discount_value = getLineItemDiscountValue(
        resultListReturnProducts[index],
      );
      resultListReturnProducts[index].discount_rate = getLineItemDiscountRate(
        resultListReturnProducts[index],
      );
      resultListReturnProducts[index].discount_amount = getLineItemDiscountAmount(
        resultListReturnProducts[index],
      );
      resultListReturnProducts[index].line_amount_after_line_discount =
        getLineAmountAfterLineDiscount(resultListReturnProducts[index]);
    }
    if (setListReturnProducts) {
      setListReturnProducts(resultListReturnProducts);
    }
    if (
      resultListReturnProducts.some((single) => {
        return single.maxQuantityCanBeReturned && single.quantity < single.maxQuantityCanBeReturned;
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
    [OrderDetail],
  );

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

  // const eventKeyPress = useCallback(
  // 	(event: KeyboardEvent) => {

  // 	},

  // 	[onChangeProductSearchValue]
  // );

  // useEffect(() => {
  // 	window.addEventListener("keypress", eventKeyPress);
  // 	return () => {
  // 		window.removeEventListener("keypress", eventKeyPress);
  // 	};
  // }, [eventKeyPress]);

  /**
   * tính toán refund khi tiêu điểm
   */
  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    let isUsingPoint = isOrderDetailHasPointPayment(OrderDetail, paymentMethods);
    const refund_money = listReturnProducts ? getTotalPrice(listReturnProducts) : 0;
    if (isUsingPoint) {
      if (OrderDetail?.customer_id && orderId && refund_money > 0) {
        const listReturnProductsResult = listReturnProducts.filter((item) => {
          return item.quantity > 0;
        });
        const returnItems = listReturnProductsResult.map((item) => {
          const { maxQuantityCanBeReturned, ...rest } = item;
          return rest;
        });
        // console.log('returnItems', returnItems)
        const returnOrderNow: OrderResponse[] = [
          {
            ...OrderDetail,
            items: returnItems,
          },
        ];
        let return_items = [...returnOrderNow];
        if (OrderDetail.order_returns) {
          return_items = [...OrderDetail.order_returns, ...returnOrderNow];
        }
        let params: OrderReturnCalculateRefundRequestModel = {
          customerId: OrderDetail.customer_id,
          items: OrderDetail.items,
          orderId,
          refund_money,
          return_items,
        };
        setTimeout(() => {
          dispatch(
            actionGetOrderReturnCalculateRefund(params, (response) => {
              if (!response.point_refund) {
                if (!isAlreadyShowWarningPoint) {
                  setIsVisibleModalWarningPointRefund && setIsVisibleModalWarningPointRefund(true);
                  // setIsAlreadyShowWarningPoint(true)
                }
              }
              if (setRefund) {
                setRefund({
                  ...refund,
                  pointRefund: response.point_refund,
                  moneyRefund: response.money_refund,
                });
              }
            }),
          );
        }, 500);
      } else {
        if (setRefund) {
          setRefund({
            ...refund,
            pointRefund: 0,
            moneyRefund: 0,
          });
        }
      }
    }
    // bỏ isAlreadyShowWarningPoint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    OrderDetail,
    OrderDetail?.customer_id,
    OrderDetail?.items,
    OrderDetail?.payments,
    dispatch,
    getTotalPrice,
    listReturnProducts,
    orderId,
    setIsVisibleModalWarningPointRefund,
    setRefund,
  ]);

  useEffect(() => {
    if (!listReturnProducts) {
      return;
    }
    let result = 0;

    let isUsingPoint = isOrderDetailHasPointPayment(OrderDetail, paymentMethods);
    if (!isUsingPoint) {
      if (!orderId) {
        return;
      }
      if (setTotalAmountReturnProducts) {
        // result = getTotalPrice(listReturnProducts);
        let resultListReturnProducts = [...listReturnProducts].filter((single) => single.quantity);
        if (resultListReturnProducts.length > 0) {
          const params: CalculateMoneyRefundRequestModel = {
            items: resultListReturnProducts.map((single) => {
              return {
                order_line_id: single.id,
                sku: single.sku,
                quantity: single.quantity,
              };
            }),
          };
          // console.log('params', params)
          dispatch(showLoading());
          calculateMoneyRefundService(orderId, params)
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                result = response.data;
                if (setTotalAmountReturnProducts) {
                  setTotalAmountReturnProducts(Math.round(result));
                }
              } else {
                handleFetchApiError(response, "Tính tiền hoàn lại", dispatch);
              }
              // console.log('response', response)
            })
            .finally(() => {
              dispatch(hideLoading());
            });
        } else {
          result = 0;
        }
      }
    } else {
      if (refund?.moneyRefund) {
        result = refund?.moneyRefund;
      }
    }

    if (setTotalAmountReturnProducts) {
      setTotalAmountReturnProducts(Math.round(result));
    }
  }, [
    OrderDetail,
    dispatch,
    getTotalPrice,
    paymentMethods,
    listReturnProducts,
    orderId,
    refund?.moneyRefund,
    setTotalAmountReturnProducts,
  ]);

  return (
    <CardReturnProducts
      OrderDetail={OrderDetail}
      convertResultSearchVariant={convertResultSearchVariant}
      handleChangeReturnAll={handleChangeReturnAll}
      isExchange={isExchange}
      isCheckReturnAll={isCheckReturnAll}
      listReturnProducts={listReturnProducts}
      onChangeProductQuantity={onChangeProductQuantity}
      onChangeProductSearchValue={onChangeProductSearchValue}
      onSelectSearchedVariant={onSelectSearchedVariant}
      pointUsing={refund?.pointRefund}
      searchVariantInputValue={searchVariantInputValue}
      totalAmountReturnProducts={totalAmountReturnProducts}
      isShowProductSearch={true}
      setListReturnProducts={setListReturnProducts}
      stores={stores}
      autoCompleteRef={autoCompleteRef}
    />
  );
}

export default CardReturnProductContainer;
