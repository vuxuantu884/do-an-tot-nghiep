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
import { showError, showModalError, showSuccess } from "utils/ToastUtils";
import { HandoverReturn, HandoverTransfer } from "../../handover.config";
import HandoverTable from "../table/handover-table.component";
import { StyledComponent } from "./styles";

const { Item } = Form;

export interface FulfillmentComponentType {
  isLoading: boolean;
  onDelete?: (codes: Array<string>, onSuccess: () => void) => void;
  onUpdate?: (request: Array<HandoverOrderRequest>, ordedDisplay: Array<FulfillmentDto>) => void;
}

const FulfillmentComponent: React.FC<FulfillmentComponentType> = (
  props: FulfillmentComponentType,
) => {
  const dispatch = useDispatch();
  const [keySearch, setKeySearch] = useState("");
  const [searching, setSearching] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<string>>([]);

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
        return true;
      }
      return false;
    },
    [keySearch],
  );

  const toggleInput = useCallback(() => {
    setTimeout(() => {
      setSearching(false);
      let element = document.getElementById("input-search");
      setKeySearch("");
      element?.focus();
    }, 100);
  }, []);

  const isFulfillmentReturningOrReturned = (fulfillment: FulfillmentDto) => {
    if (
      fulfillment.status === FulfillmentStatus.CANCELLED &&
      fulfillment.return_status === FulfillmentStatus.RETURNED &&
      fulfillment.status_before_cancellation === FulfillmentStatus.SHIPPING
    ) {
      return true; // là đơn đã hoàn
    }

    if (
      fulfillment.status === FulfillmentStatus.SHIPPING &&
      fulfillment.return_status === FulfillmentStatus.RETURNING
    ) {
      return true; // là đơn đang hoàn
    }

    return false;
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
        showModalError("Đơn hàng đã nằm trong biển bản khác");
        toggleInput();
        return;
      }
      fulfillmentSearchService(keySearch)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            let { data } = response;
            if (type === HandoverTransfer && data.status !== FulfillmentStatus.PACKED) {
              showModalError("Đơn hàng chưa được đóng gói");
              return;
            }
            if (type === HandoverReturn && !isFulfillmentReturningOrReturned(data)) {
              showModalError("Đơn hàng không ở trạng thái đang hoàn hoặc đã hoàn");
              return;
            }
            if (data.stock_location_id !== store_id) {
              showModalError("Đơn hàng không thuộc kho đóng gói");
              return;
            }
            let delivery = -1;
            if (data.shipment.delivery_service_provider_id !== null) {
              delivery = data.shipment.delivery_service_provider_id;
            }

            if (delivery !== delivery_service_provider_id) {
              showModalError("Đơn hàng không cùng hãng vận chuyển");
              return;
            }
            if (
              delivery !== -1 &&
              type === HandoverTransfer &&
              data.shipment.pushing_status !== PUSHING_STATUS.COMPLETED
            ) {
              showModalError(`Đơn ${keySearch} đẩy sang hãng vận chuyển thất bại`);
              return;
            }

            if (channel_id !== -1 && channel_id !== data.order.channel_id) {
              showModalError(`Đơn ${keySearch} không cùng biên bản sàn`);
              return;
            }
            let orders: Array<HandoverOrderRequest> = getFieldValue("orders");
            let index = orders.findIndex((value) => value.fulfillment_code === data.code);
            if (index !== -1) {
              showModalError("Đơn hàng đã nằm trong biên bản");
              return;
            }
            let order_display = getFieldValue("order_display");
            let newOrder: HandoverOrderRequest = {
              id: null,
              handover_id: id,
              fulfillment_code: data.code,
            };
            const newOrderValue = [newOrder, ...orders];
            const newOrderDisplay = [data, ...order_display];
            if (props.onUpdate) {
              props.onUpdate(newOrderValue, newOrderDisplay);
              return;
            }
            setFieldsValue({
              orders: newOrderValue,
              order_display: newOrderDisplay,
            });
          } else {
            handleFetchApiError(response, "Tìm kiếm đơn hàng", dispatch);
          }
        })
        .catch((e) => {
          showError("Có lỗi api tìm kiếm đơn hàng");
        })
        .finally(() => {
          toggleInput();
        });
    },
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
    <Card title="Danh sach đơn hàng trong biên bản">
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
                        placeholder="ID đơn hàng/Mã vận đơn"
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
            );
          }}
        </Item>
      </StyledComponent>
    </Card>
  );
};

export default FulfillmentComponent;
