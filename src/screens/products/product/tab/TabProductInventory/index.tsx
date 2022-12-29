import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
import { EInventoryStatus, formatCurrencyForProduct } from "screens/products/helper";
import { Link } from "react-router-dom";
import React, { useCallback } from "react";
import UrlConfig from "config/url.config";
import { ChannelResponse } from "model/response/product/channel.response";
import useGetChannels from "hook/order/useGetChannels";
import { FulFillmentStatus, POS, ProcurementStatus } from "utils/Constants";
import { BaseQuery } from "model/base/base.query";
import { generateQuery } from "utils/AppUtils";
import { OrderStatus, ORDER_SUB_STATUS } from "utils/Order.constants";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { STATUS_INVENTORY_TRANSFER } from "screens/inventory/constants";
import { InventoryTransferPendingStatus } from "screens/inventory/helper";

type TabProductInventoryProps = {
  data: PageResponse<InventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
  isLoadingInventories?: boolean;
};

const TabProductInventory: React.FC<TabProductInventoryProps> = (
  props: TabProductInventoryProps,
) => {
  const { data, isLoadingInventories } = props;
  const channels = useGetChannels();

  const goDocument = useCallback(
    (inventoryStatus: string, sku: string, variantName: string, store_id?: number) => {
      let linkDocument = "";
      let store_ids = undefined;
      const baseQuery: BaseQuery = {
        page: 1,
        limit: 30,
      };
      if (store_id) {
        store_ids = store_id;
      }
      const channelCodesFilter: Array<string> = [];
      channels.forEach((channel: ChannelResponse) => {
        if (channel.code.toUpperCase() !== POS.channel_code) {
          channelCodesFilter.push(channel.code);
        }
      });

      switch (inventoryStatus) {
        case EInventoryStatus.COMMITTED:
          const committedQuery = generateQuery({
            ...baseQuery,
            is_online: true,
            order_status: OrderStatus.FINALIZED,
            searched_product: sku,
            fulfillment_status: [FulFillmentStatus.CANCELLED, FulFillmentStatus.UNSHIPPED],
            sub_status_code: [
              ORDER_SUB_STATUS.first_call_attempt,
              ORDER_SUB_STATUS.second_call_attempt,
              ORDER_SUB_STATUS.third_call_attempt,
              ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
              ORDER_SUB_STATUS.coordinator_confirming,
              ORDER_SUB_STATUS.awaiting_saler_confirmation,
              ORDER_SUB_STATUS.coordinator_confirmed,
              ORDER_SUB_STATUS.require_warehouse_change,
              ORDER_SUB_STATUS.merchandise_picking,
              ORDER_SUB_STATUS.merchandise_packed,
              ORDER_SUB_STATUS.awaiting_shipper,
              ORDER_SUB_STATUS.out_of_stock,
              ORDER_SUB_STATUS.delivery_service_cancelled,
              ORDER_SUB_STATUS.customer_confirming,
            ],
            channel_codes: channelCodesFilter,
            store_ids: store_ids,
          });
          linkDocument = `${UrlConfig.ORDER}?${committedQuery}`;
          break;
        case EInventoryStatus.IN_COMING:
          const sevenDaysAgo = moment(new Date())
            .subtract(7, "days")
            .format(DATE_FORMAT.DD_MM_YYYY)
            .toString();
          const inComingQuery = generateQuery({
            ...baseQuery,
            stores: store_ids,
            status: [ProcurementStatus.draft, ProcurementStatus.not_received],
            expect_receipt_from: sevenDaysAgo,
            content: sku,
          });
          linkDocument = `${UrlConfig.PROCUREMENT}?${inComingQuery}`;
          break;
        case EInventoryStatus.ON_HOLD:
          const onHoldQuery = generateQuery({
            ...baseQuery,
            simple: true,
            from_store_id: store_ids,
            status: [
              STATUS_INVENTORY_TRANSFER.CONFIRM.status,
              STATUS_INVENTORY_TRANSFER.PENDING.status,
            ],
            condition: sku,
            pending: InventoryTransferPendingStatus.EXCESS,
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onHoldQuery}`;
          break;
        case EInventoryStatus.ON_WAY:
          const onWayQuery = generateQuery({
            ...baseQuery,
            simple: true,
            from_store_id: store_ids,
            status: [
              STATUS_INVENTORY_TRANSFER.TRANSFERRING.status,
              STATUS_INVENTORY_TRANSFER.PENDING.status,
            ],
            condition: sku,
            pending: InventoryTransferPendingStatus.MISSING,
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onWayQuery}`;
          break;
        case EInventoryStatus.TRANSFERRING:
          const onTransferringQuery = generateQuery({
            ...baseQuery,
            simple: true,
            condition: sku,
            to_store_id: store_ids,
            status: [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status],
            pending: InventoryTransferPendingStatus.MISSING,
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onTransferringQuery}`;
          break;
        case EInventoryStatus.DEFECT:
          const defectQuery = generateQuery({
            ...baseQuery,
            store_ids: store_ids,
            condition: sku,
          });
          linkDocument = `${UrlConfig.INVENTORY_DEFECTS}?${defectQuery}`;
          break;
        case EInventoryStatus.SHIPPING:
          const shippingQuery = generateQuery({
            ...baseQuery,
            is_online: true,
            fulfillment_status: [FulFillmentStatus.SHIPPING],
            searched_product: sku,
            channel_codes: channelCodesFilter,
            store_ids: store_ids,
          });
          linkDocument = `${UrlConfig.ORDER}?${shippingQuery}`;
          break;
        default:
          break;
      }
      return linkDocument;
    },
    [channels],
  );

  return (
    <div>
      <CustomTable
        className="small-padding"
        dataSource={data.items}
        pagination={false}
        isLoading={isLoadingInventories}
        sticky={{ offsetHeader: 55, offsetScroll: 10 }}
        rowKey={(record) => record.id}
        columns={[
          {
            title: "Kho hàng",
            dataIndex: "store",
          },
          {
            align: "center",
            title: "Tổng tồn",
            dataIndex: "total_stock",
            render: (value) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
          {
            align: "center",
            title: "Tồn trong kho",
            dataIndex: "on_hand",
            render: (value) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
          {
            align: "center",
            title: "Đang giao dịch",
            dataIndex: "committed",
            render: (value: number, record: InventoryResponse) => {
              return (
                <div>
                  {" "}
                  {value ? (
                    <Link
                      target="_blank"
                      to={goDocument(
                        EInventoryStatus.COMMITTED,
                        record.sku,
                        record.name,
                        record.store_id,
                      )}
                    >
                      {formatCurrencyForProduct(value)}
                    </Link>
                  ) : (
                    ""
                  )}
                </div>
              );
            },
          },
          {
            align: "center",
            title: "Có thể bán",
            dataIndex: "available",
            render: (value) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
          {
            align: "center",
            title: "Tạm giữ",
            dataIndex: "on_hold",
            render: (value: number, record: InventoryResponse) => {
              return (
                <div>
                  {" "}
                  {value ? (
                    <Link
                      target="_blank"
                      to={goDocument(
                        EInventoryStatus.ON_HOLD,
                        record.sku,
                        record.name,
                        record.store_id,
                      )}
                    >
                      {formatCurrencyForProduct(value)}
                    </Link>
                  ) : (
                    ""
                  )}
                </div>
              );
            },
          },
          {
            align: "center",
            title: "Hàng lỗi",
            dataIndex: "defect",
            render: (value, record: InventoryResponse) => {
              return value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.DEFECT, record.sku, record.name, record.store_id)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              );
            },
          },
          {
            align: "center",
            title: "Chờ nhập",
            dataIndex: "in_coming",
            render: (value: number, record: InventoryResponse) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
          {
            align: "center",
            title: "Đang chuyển đến",
            dataIndex: "transferring",
            render: (value: number, record: InventoryResponse) => {
              return (
                <div>
                  {" "}
                  {value ? (
                    <Link
                      target="_blank"
                      to={goDocument(
                        EInventoryStatus.TRANSFERRING,
                        record.sku,
                        record.name,
                        record.store_id,
                      )}
                    >
                      {formatCurrencyForProduct(value)}
                    </Link>
                  ) : (
                    ""
                  )}
                </div>
              );
            },
          },
          {
            align: "center",
            title: "Đang chuyển đi",
            dataIndex: "on_way",
            render: (value: number, record: InventoryResponse) => {
              return (
                <div>
                  {" "}
                  {value ? (
                    <Link
                      target="_blank"
                      to={goDocument(
                        EInventoryStatus.ON_WAY,
                        record.sku,
                        record.name,
                        record.store_id,
                      )}
                    >
                      {formatCurrencyForProduct(value)}
                    </Link>
                  ) : (
                    ""
                  )}
                </div>
              );
            },
          },
          {
            align: "center",
            title: "Hàng đang giao",
            dataIndex: "shipping",
            render: (value, record: InventoryResponse) => {
              return value ? (
                <Link
                  target="_blank"
                  to={goDocument(
                    EInventoryStatus.SHIPPING,
                    record.sku,
                    record.name,
                    record.store_id,
                  )}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default TabProductInventory;
