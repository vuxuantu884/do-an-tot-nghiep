import React, { useMemo, useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import { Button, Divider, Modal, Spin } from "antd";
// import "assets/css/_modal.scss";
import { InventoryResponse } from "model/inventory";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import { useDispatch, useSelector } from "react-redux";
import { StoreResponse } from "model/core/store.model";
import { StoreSearchListAction } from "domain/actions/core/store.action";
import { OrderLineItemResponse, OrderResponse } from "model/response/order/order.response";
import { OrderSplitModel } from "./_model";
import OrderSplit from "./OrderSqlit";
import _ from "lodash";
import { AppConfig } from "config/app.config";
import { DEFAULT_COMPANY, TaxTreatment } from "utils/Constants";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderRequest } from "model/request/order.request";
import { createRequest } from "./helper";
import { orderCreateAction } from "domain/actions/order/order.action";
import UrlConfig from "config/url.config";
import { showError, showModalSuccess } from "utils/ToastUtils";
import { Type } from "config/type.config";

type Props = {
  visible?: boolean;
  setVisible?: (v: boolean) => void;
  OrderDetail: OrderResponse | null;
};

const OrderSplitModal: React.FC<Props> = (props: Props) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [orderSplits, setOrderSplit] = useState<OrderSplitModel[]>([]);

  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);
  const [storeArrayResponse, setStoreArrayResponse] = useState<Array<StoreResponse> | null>([]);

  const items = useMemo(() => props.OrderDetail?.items || [], [props.OrderDetail]);
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

  const onCancel = () => {
    props.setVisible && props.setVisible(false);
  };

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
        return item.type === Type.GIFT && item.position === itemNormal.position;
      });
    };
    const _items = _order.items
      .filter((item) => {
        return item.type !== Type.GIFT;
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

  const onFinish = useCallback(() => {
    if (orderSplits.some((p) => p.items.some((p1) => !p1.quantity || p1.quantity === 0))) {
      showError("Số lượng không được nhỏ hơn hoặc bằng 0");
      return;
    }

    if (orderSplits.some((p) => !p.store_id)) {
      showError("Cửa hàng không được phép để trống");
      return;
    }

    const totalIndex = orderSplits.length - 1;
    const firstIndex = 0;
    let lastIndex = 0;
    let newOrderId: number[] = [];
    const createOrder = async (index: number) => {
      setLoading(true);
      const request = createRequest(initialRequest, orderSplits[index]) as OrderRequest;
      request.note = `${request.note} Đơn tách ${index + 1} từ ${orderSplits[index].code}`;
      console.log("onFinish request index", index, request);
      try {
        await dispatch(
          orderCreateAction(
            request,
            (data) => {
              newOrderId.push(data.id);
              lastIndex += 1;
              setTimeout(() => {
                if (lastIndex <= totalIndex) {
                  createOrder(lastIndex);
                } else {
                  setLoading(false);
                  showModalSuccess("Tách đơn thành công");
                  newOrderId.forEach((p) => {
                    onCancel();
                    p && window.open(`${process.env.PUBLIC_URL}${UrlConfig.ORDER}/${p}`, "_blank");
                  });
                }
              }, 1500);
            },
            () => {
              setLoading(false);
              onCancel();
              showModalSuccess("Tách đơn xảy ra lỗi!");
              console.log(
                "Thời gian nhận response tạo đơn check đơn trùng:",
                `Thời gian:${new Date().toJSON()}`,
              );
            },
          ),
        );
      } catch (error) {
        showModalSuccess("Tách đơn xảy ra lỗi!");
        onCancel();
        console.log("error", error);
        setLoading(false);
      }

      // lastIndex += 1;
      // setTimeout(() => {
      //   if (lastIndex <= totalIndex) {
      //     createOrder(lastIndex);
      //   }
      // }, 3000);
    };
    createOrder(firstIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, initialRequest, orderSplits]);

  /**
   * lấy toàn bộ thông tin cửa hàng
   */
  useEffect(() => {
    dispatch(StoreSearchListAction("", setStoreArrayResponse));
  }, [dispatch]);

  /**
   * lấy thông tin tồn kho bao gôm sản phẩm và quà tặng
   */
  useEffect(() => {
    if (items && items != null && items?.length > 0) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
  }, [dispatch, items, items?.length]);

  /**
   * mở modal thì hiển thị trước 1 đơn tách
   */
  useEffect(() => {
    if (!props.OrderDetail) return;
    const _order: OrderSplitModel = _.cloneDeep(props.OrderDetail);
    let getGiftResponse = (itemNormal: OrderLineItemResponse) => {
      return _order.items.filter((item) => {
        return item.type === Type.GIFT && item.position === itemNormal.position;
      });
    };
    const _items = _order.items
      .filter((item) => {
        return item.type !== Type.GIFT;
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
  }, [props.OrderDetail]);

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
                inventoryResponse={inventoryResponse}
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
