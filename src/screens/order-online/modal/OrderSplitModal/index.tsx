import React, { useMemo, useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import { Button, Divider, Modal, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { StoreResponse } from "model/core/store.model";
import { StoreSearchListAction } from "domain/actions/core/store.action";
import { OrderLineItemResponse, OrderResponse } from "model/response/order/order.response";
import { OrderSplitModel } from "./_model";
import OrderSplit from "./OrderSplit";
import _ from "lodash";
import { AppConfig } from "config/app.config";
import { DEFAULT_COMPANY, TaxTreatment } from "utils/Constants";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderRequest } from "model/request/order.request";
import { createRequest } from "./helper";
// import { orderCreateAction } from "domain/actions/order/order.action";
import UrlConfig from "config/url.config";
import { showError, showSuccess } from "utils/ToastUtils";
import { defaultSpecialOrderParams } from "component/order/special-order/SideBarOrderSpecial/helper";
import { specialOrderServices } from "service/order/special-order.service";
import { ACCOUNT_CODE_LOCAL_STORAGE } from "utils/LocalStorageUtils";
import { orderPostApi } from "service/order/order.service";
import { EnumGiftType } from "config/enum.config";
import { isGiftLineItem } from "utils/OrderUtils";

type Props = {
  visible?: boolean;
  setVisible?: (v: boolean) => void;
  OrderDetail: OrderResponse | any;
};

const OrderSplitModal: React.FC<Props> = (props: Props) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [orderSplits, setOrderSplit] = useState<OrderSplitModel[]>([]);

  const [storeArrayResponse, setStoreArrayResponse] = useState<Array<StoreResponse> | null>([]);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  let initialRequest: OrderRequest = useMemo(() => {
    return {
      action: "", //finalized
      store_id: null,
      company_id: DEFAULT_COMPANY.company_id,
      price_type: AppConfig.price_type, //giá bán lẻ giá bán buôn
      tax_treatment: TaxTreatment.INCLUSIVE,
      delivery_service_provider_id: null,
      shipper_code: null,
      shipper_name: "",
      delivery_fee: null,
      shipping_fee_informed_to_customer: null,
      shipping_fee_paid_to_three_pls: null,
      dating_ship: undefined,
      requirements: null,
      source_id: null,
      note: "",
      tags: "",
      customer_note: "",
      account_code: userReducer.account?.code,
      assignee_code: userReducer.account?.code || null,
      marketer_code: null,
      coordinator_code: null,
      customer_id: null,
      reference_code: "",
      url: "",
      total_line_amount_after_line_discount: null,
      total: null,
      total_tax: "",
      total_discount: null,
      currency: AppConfig.currency,
      items: [],
      discounts: [],
      fulfillments: [],
      shipping_address: null,
      billing_address: null,
      payments: [],
      channel_id: null,
      automatic_discount: true,
      export_bill: false,
      type: undefined,
    };
  }, [userReducer.account?.code]);

  const onCancel = useCallback(() => {
    props.setVisible && props.setVisible(false);
  }, [props]);

  /**
   * thêm một đơn tách
   */
  const handleAddOrderSplit = useCallback(() => {
    if (!props.OrderDetail) return;
    if (orderSplits.length === 10) {
      showError("Số lượng tách cùng lúc, tối đa là 10 đơn");
      return;
    }
    const _order: OrderSplitModel = _.cloneDeep(props.OrderDetail);
    let getGiftResponse = (itemNormal: OrderLineItemResponse) => {
      return _order.items.filter((item) => {
        return isGiftLineItem(item.type) && item.position === itemNormal.position;
      });
    };
    const _items = _order.items
      .filter((item) => {
        return !isGiftLineItem(item.type);
      })
      .map((item) => {
        return {
          ...item,
          single_distributed_order_discount: (item.distributed_order_discount ?? 0) / item.quantity,
          gifts: getGiftResponse(item),
        };
      });
    _order.items = _items;

    _order.store_id = null;
    _order.store = null;
    let _orderSplits: OrderSplitModel[] = [...orderSplits];
    _orderSplits.push({ ..._order });
    setOrderSplit(_orderSplits);
  }, [orderSplits, props.OrderDetail]);

  /**
   * Cập nhập thông tin cho đơn tách
   */
  const handleChangeOrderSplit = useCallback(
    (order: OrderSplitModel, index: number) => {
      let _orderSplits: OrderSplitModel[] = [...orderSplits];
      _orderSplits[index] = { ...order };
      setOrderSplit && setOrderSplit(_orderSplits);
    },
    [orderSplits],
  );

  /**
   * xóa đơn tách
   */
  const handleRemoveOrderSplit = useCallback(
    (index: number) => {
      let _orderSplits: OrderSplitModel[] = _.cloneDeep(orderSplits);
      _orderSplits.splice(index, 1);
      setOrderSplit(_orderSplits);
    },
    [orderSplits],
  );

  const handleCreateOrUpdateSpecialOrder = (id: string | number, order_original_code: string) => {
    (async () => {
      try {
        let resultParams = {
          ...defaultSpecialOrderParams,
          order_carer_code: localStorage.getItem(ACCOUNT_CODE_LOCAL_STORAGE),
          order_original_code: order_original_code,
          type: "orders_split",
        };
        await specialOrderServices.createOrUpdate(id, resultParams);
        window.open(`${process.env.PUBLIC_URL}${UrlConfig.ORDER}/${id}`, "_blank");
      } catch (error) {}
    })();
  };

  const onFinish = useCallback(() => {
    if (orderSplits.some((p) => p.items.some((p1) => !p1.quantity || p1.quantity === 0))) {
      showError("Số lượng không được nhỏ hơn hoặc bằng 0");
      return;
    }

    if (orderSplits.some((p) => !p.store_id)) {
      showError("Cửa hàng không được phép để trống");
      return;
    }

    (async () => {
      let newOrderSuccess: any[] = [];
      let newOrderFailed: string[] = [];
      setLoading(true);
      await Promise.all(
        orderSplits.map(async (orderSplits: any, index: number) => {
          const request = createRequest(initialRequest, orderSplits) as OrderRequest;
          request.note = `${request.note} Đơn tách ${index + 1} từ ${orderSplits.code}`;
          try {
            const createOrder = await orderPostApi(request);
            if (!createOrder.errors) {
              newOrderSuccess.push({
                orderSplitsCode: orderSplits.code,
                newOrderID: createOrder.data.id,
                newOrderCode: createOrder.data.code,
              });
            } else {
              newOrderFailed.push(`Đơn tách ${index + 1} từ ${orderSplits.code} đã xảy ra lỗi!`);
            }
          } catch (error) {
            console.log("error", error);
          }
        }),
      );
      newOrderSuccess.forEach((order: any) => {
        showSuccess(`Tạo thành công đơn tách ${order.newOrderCode}`);
        handleCreateOrUpdateSpecialOrder(order.newOrderID, order.orderSplitsCode);
      });
      newOrderFailed.forEach((error: string) => {
        showError(error);
      });
      setLoading(false);
      onCancel();
    })();
  }, [initialRequest, onCancel, orderSplits]);

  /**
   * lấy toàn bộ thông tin cửa hàng
   */
  useEffect(() => {
    dispatch(StoreSearchListAction("", setStoreArrayResponse));
  }, [dispatch]);

  /**
   * mở modal thì hiển thị trước 1 đơn tách
   */
  useEffect(() => {
    if (!props.OrderDetail) return;
    const _order: OrderSplitModel = _.cloneDeep(props.OrderDetail);
    let getGiftResponse = (itemNormal: OrderLineItemResponse) => {
      return _order.items.filter((item) => {
        return isGiftLineItem(item.type) && item.position === itemNormal.position;
      });
    };
    const _items = _order.items
      .filter((item) => {
        return !isGiftLineItem(item.type);
      })
      .map((item) => {
        return {
          ...item,
          single_distributed_order_discount: (item.distributed_order_discount ?? 0) / item.quantity,
          gifts: getGiftResponse(item),
        };
      });

    console.log("item split", _items);
    _order.items = _items;
    _order.store_id = null;
    _order.store = null;
    let _orderSplits: OrderSplitModel[] = [_order];
    setOrderSplit(_orderSplits);
  }, [props.OrderDetail, props.OrderDetail.items]);

  return (
    <React.Fragment>
      <Modal
        title="Tách đơn"
        width={900}
        visible={props.visible}
        onCancel={() => !loading && onCancel()}
        footer={
          <React.Fragment>
            <Button danger ghost onClick={() => !loading && onCancel()} disabled={loading}>
              Đóng
            </Button>
            <Button type="primary" onClick={onFinish} loading={loading}>
              Tách đơn
            </Button>
          </React.Fragment>
        }
        className="order-split-modal"
        maskClosable={false}
      >
        <Spin spinning={loading} tip="Đang tải... không tắt trình duyệt trong quá trình tách đơn!">
          <StyledComponent>
            {orderSplits.map((data, index) => (
              <OrderSplit
                index={index}
                orderSplit={data}
                storeArrayResponse={storeArrayResponse}
                handleChangeOrderSplit={(order) => handleChangeOrderSplit(order, index)}
                handleRemoveOrderSplit={() => handleRemoveOrderSplit(index)}
              />
            ))}

            <Divider orientation="left" plain>
              <Button type="link" onClick={() => handleAddOrderSplit()}>
                + Thêm đơn tách
              </Button>
            </Divider>
          </StyledComponent>
        </Spin>
      </Modal>
    </React.Fragment>
  );
};
export default OrderSplitModal;
