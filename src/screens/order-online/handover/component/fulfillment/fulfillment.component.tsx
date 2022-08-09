import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import search from "assets/img/search.svg";
import ActionButton from "component/table/ActionButton";
import { FulfillmentDto } from "model/handover/fulfillment.dto";
import { HandoverOrderRequest } from "model/handover/handover.request";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fulfillmentSearchService } from "service/handover/ffm.service";
import { validateHandoverService } from "service/handover/handover.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { PUSHING_STATUS } from "utils/Constants";
import { FulfillmentStatus } from "utils/FulfillmentStatus.constant";
import { isFulfillmentReturned, isFulfillmentReturning } from "utils/OrderUtils";
import { showError, showModalError, showSuccess } from "utils/ToastUtils";
import { HandoverReturn, HandoverTransfer } from "../../handover.config";
import HandoverTable from "../table/handover-table.component";
import { StyledComponent } from "./styles";
import audio from "assets/audio/am-bao-tra-loi-sai.wav";

const { Item } = Form;

export interface FulfillmentComponentType {
  isLoading: boolean;
  onDelete?: (codes: Array<string>, onSuccess: () => void) => void;
  onUpdate?: (
    request: Array<HandoverOrderRequest>,
    ordedDisplay: Array<FulfillmentDto>,
    handleToggleInput?: () => void,
  ) => void;
}

const FulfillmentComponent: React.FC<FulfillmentComponentType> = (
  props: FulfillmentComponentType,
) => {
  const dispatch = useDispatch();
  const [keySearch, setKeySearch] = useState("");
  const [searching, setSearching] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<string>>([]);

  const AudioPlay = new Audio(audio);

  const onDeleted = useCallback(
    (setFieldsValue: (value: any) => void, getFieldValue: (value: string) => any) => {
      if (props.onDelete) {
        props.onDelete(selected, () => {
          showSuccess(`Xóa ${selected.length} đơn trong biên bản thành công`);
          setSelected([]);
        });
        return;
      }
      let orders: Array<HandoverOrderRequest> = getFieldValue("orders");
      let order_display: Array<FulfillmentDto> = getFieldValue("order_display");
      selected.forEach((valueSelected) => {
        let indexOrders = orders.findIndex((value) => value.fulfillment_code === valueSelected);
        orders.splice(indexOrders, 1);
        let indexDisplay = order_display.findIndex((value) => value.code === valueSelected);
        order_display.splice(indexDisplay, 1);
      });

      setSelected([]);
      setFieldsValue({
        orders: [...orders],
        order_display: [...order_display],
      });
    },
    [props, selected],
  );

  const validate = useCallback(
    async (type: string, id: number | null) => {
      const response = await validateHandoverService(keySearch, type, id);
      if (isFetchApiSuccessful(response)) {
        if (!response?.data?.success) {
          showNotification(
            `Đơn giao ${keySearch} đã nằm trong biên bản ${response?.data?.code_handover}`,
          );
          return false;
        } else {
          return true;
        }
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keySearch],
  );

  const toggleInput = useCallback(() => {
    setSearching(false);
    console.log("setSearching ok");
    setTimeout(() => {
      let element: any = document.getElementById("input-search");
      console.log("element", element);
      setKeySearch("");
      element?.focus();
      element?.select();
    }, 100);
  }, []);

  const isFulfillmentReturningOrReturned = (fulfillment: FulfillmentDto) => {
    if (isFulfillmentReturned(fulfillment) || isFulfillmentReturning(fulfillment)) {
      return true;
    }
    return false;
  };

  const showNotification = (msg: React.ReactNode, title?: string | undefined) => {
    showModalError(msg, title);
    AudioPlay.play();
    AudioPlay.currentTime = 1;
  };

  const onSearch = useCallback(
    async (
      id: number,
      store_id: number,
      type: string,
      delivery_service_provider_id: number,
      channel_id,
      setFieldsValue: (value: any) => void,
      getFieldValue: (value: string) => any,
    ) => {
      if (keySearch === "") {
        return;
      }
      setSearching(true);
      let validateStatus = await validate(type, id);
      if (!validateStatus) {
        toggleInput();
        return;
      }
      fulfillmentSearchService(keySearch)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            let { data } = response;

            let order_display = getFieldValue("order_display");

            //kiểm tra hợp lệ các đơn đã trong biên bản ////////////////////////
            if (order_display && order_display.length !== 0) {
              if (type === HandoverTransfer) {
                const fulfillmentStatusNotPacked = order_display.filter(
                  (p: FulfillmentDto) => p.status !== FulfillmentStatus.PACKED,
                );
                if (fulfillmentStatusNotPacked && fulfillmentStatusNotPacked.length !== 0) {
                  showNotification(
                    `Đơn hàng ${fulfillmentStatusNotPacked[0].order_code} không ở trạng thái đóng gói`,
                  );
                  return;
                }
              }

              if (type === HandoverReturn) {
                const fulfillmentStatusNotReturn = order_display.filter(
                  (p: FulfillmentDto) => !isFulfillmentReturningOrReturned(p),
                );
                if (fulfillmentStatusNotReturn && fulfillmentStatusNotReturn.length !== 0) {
                  showNotification(
                    `Đơn hàng ${fulfillmentStatusNotReturn[0].order_code} không ở trạng thái đang hoàn hoặc đã hoàn`,
                  );
                  return;
                }
              }
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////

            if (type === HandoverTransfer && data.status !== FulfillmentStatus.PACKED) {
              showNotification(`Đơn hàng ${data.order.code} không ở trạng thái đóng gói`);
              return;
            }
            if (type === HandoverReturn && !isFulfillmentReturningOrReturned(data)) {
              showNotification(
                `Đơn hàng ${data.order.code} không ở trạng thái đang hoàn hoặc đã hoàn`,
              );
              return;
            }
            if (data.stock_location_id !== store_id) {
              showNotification(`Đơn hàng ${data.order.code} không thuộc kho đóng gói`);
              return;
            }
            let delivery = -1;
            if (data.shipment.delivery_service_provider_id !== null) {
              delivery = data.shipment.delivery_service_provider_id;
            }

            if (delivery !== delivery_service_provider_id) {
              showNotification(`Đơn hàng ${data.order.code} không cùng hãng vận chuyển`);
              return;
            }
            if (
              delivery !== -1 &&
              type === HandoverTransfer &&
              data.shipment.pushing_status !== PUSHING_STATUS.COMPLETED
            ) {
              showNotification(`Đơn hàng ${data.order.code} đẩy sang hãng vận chuyển thất bại`);
              return;
            }

            if (channel_id !== -1 && channel_id !== data.order.channel_id) {
              showNotification(`Đơn hàng ${data.order.code} không cùng biên bản sàn`);
              return;
            }
            let orders: Array<HandoverOrderRequest> = getFieldValue("orders");
            let index = orders.findIndex((value) => value.fulfillment_code === data.code);
            if (index !== -1) {
              showNotification(`Đơn hàng ${data.order.code} đã nằm trong biên bản`);
              return;
            }

            let newOrder: HandoverOrderRequest = {
              id: null,
              handover_id: id,
              fulfillment_code: data.code,
            };
            const newOrderValue = [newOrder, ...orders];
            const newOrderDisplay = [data, ...order_display];
            if (props.onUpdate) {
              props.onUpdate(newOrderValue, newOrderDisplay, toggleInput);
              return;
            }
            setFieldsValue({
              orders: newOrderValue,
              order_display: newOrderDisplay,
            });
          } else {
            handleFetchApiError(response, "Tìm kiếm đơn hàng", dispatch);
            AudioPlay.play();
          }
        })
        .catch((e) => {
          showNotification("Có lỗi api tìm kiếm đơn hàng");
        })
        .finally(() => {
          toggleInput();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, keySearch, props, toggleInput, validate],
  );

  const eventBarcodeOrder = useCallback(() => {}, []);
  useEffect(() => {
    const searchTermElement: any = document.getElementById("search_term");
    searchTermElement?.addEventListener("focus", (e: any) => {
      searchTermElement.select();
    });

    window.addEventListener("keypress", eventBarcodeOrder);
    return () => {
      window.removeEventListener("keypress", eventBarcodeOrder);
    };
  }, [eventBarcodeOrder]);
  return (
    <Card
      className="pack-card-orders"
      title={
        <React.Fragment>
          <div>Danh sách đơn hàng trong biên bản</div>
          <Item noStyle shouldUpdate={(prev, current) => prev["orders"] !== current["orders"]}>
            {({ getFieldValue, setFieldsValue }) => {
              let orders: Array<HandoverOrderRequest> = getFieldValue("orders");
              let totalItem = orders?.length || 0;
              return (
                <div className="ant-card-head-title-quantity-fulfillment">
                  Tổng đơn ({totalItem})
                </div>
              );
            }}
          </Item>
        </React.Fragment>
      }
    >
      <StyledComponent>
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left">
              <Item
                noStyle
                shouldUpdate={(prev, current) => prev["order_display"] !== current["order_display"]}
              >
                {({ getFieldValue, setFieldsValue }) => {
                  return (
                    <ActionButton
                      disabled={props.isLoading}
                      menu={[
                        {
                          id: 1,
                          name: "Xóa",
                          icon: <DeleteOutlined />,
                          color: "#E24343",
                          disabled: selected.length === 0,
                        },
                      ]}
                      onMenuClick={(index) => {
                        if (index === 1) {
                          onDeleted(setFieldsValue, getFieldValue);
                        }
                      }}
                    />
                  );
                }}
              </Item>
            </div>
            <div className="page-filter-right">
              <Item
                noStyle
                shouldUpdate={(prev, current) =>
                  prev["store_id"] !== current["store_id"] ||
                  prev["delivery_service_provider_id"] !==
                    current["delivery_service_provider_id"] ||
                  prev["type"] !== current["type"] ||
                  prev["channel_id"] !== current["channel_id"]
                }
              >
                {({ getFieldValue, setFieldsValue }) => {
                  const id = getFieldValue("id");
                  const store_id = getFieldValue("store_id");
                  const type = getFieldValue("type");
                  const delivery_service_provider_id = getFieldValue(
                    "delivery_service_provider_id",
                  );
                  const channel_id = getFieldValue("channel_id");
                  const disabled =
                    store_id === null ||
                    type === null ||
                    delivery_service_provider_id === null ||
                    searching ||
                    props.isLoading;
                  return (
                    <Fragment>
                      <Input
                        id="input-search"
                        value={keySearch}
                        onChange={(a) => setKeySearch(a.target.value.toUpperCase())}
                        className="input-search"
                        style={{ width: "100%" }}
                        prefix={<img src={search} alt="" />}
                        placeholder="ID đơn giao/Mã vận đơn"
                        disabled={disabled}
                        onPressEnter={(e) => {
                          e.preventDefault();
                          onSearch(
                            id,
                            store_id,
                            type,
                            delivery_service_provider_id,
                            channel_id,
                            setFieldsValue,
                            getFieldValue,
                          );
                        }}
                      />

                      <Button
                        loading={searching}
                        disabled={props.isLoading}
                        type="primary"
                        onClick={() => {
                          onSearch(
                            id,
                            store_id,
                            type,
                            delivery_service_provider_id,
                            channel_id,
                            setFieldsValue,
                            getFieldValue,
                          );
                        }}
                      >
                        Thêm đơn hàng
                      </Button>
                    </Fragment>
                  );
                }}
              </Item>
            </div>
          </div>
        </div>

        <Item
          noStyle
          shouldUpdate={(prev, current) => prev["order_display"] !== current["order_display"]}
        >
          {({ getFieldValue }) => {
            const order_display: Array<FulfillmentDto> = getFieldValue("order_display");
            return (
              order_display &&
              order_display.length !== 0 && (
                <div className="view-table">
                  <HandoverTable
                    isLoading={props.isLoading}
                    pagination={false}
                    selected={selected}
                    setSelected={(selectedCallback: Array<FulfillmentDto>) => {
                      let codes = selectedCallback.map((item) => item.code);
                      setSelected(codes);
                    }}
                    data={order_display}
                  />
                </div>
              )
            );
          }}
        </Item>
      </StyledComponent>
    </Card>
  );
};

export default FulfillmentComponent;
