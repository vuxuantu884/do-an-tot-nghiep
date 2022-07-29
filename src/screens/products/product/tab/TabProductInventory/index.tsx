import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
import { formatCurrencyForProduct } from "utils/AppUtils";
import { Link } from "react-router-dom";
import React, { useCallback } from "react";
import UrlConfig from "../../../../../config/url.config";

interface IProps {
  data: PageResponse<InventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
  loadingInventories?: boolean;
}

enum EInventoryStatus {
  COMMITTED = "committed",
  ON_HOLD = "on_hold",
  IN_COMING = "in_coming",
  TRANSFERRING = "transferring",
  ON_WAY = "on_way",
}

const TabProductInventory: React.FC<IProps> = (props: IProps) => {
  const { data, loadingInventories } = props;

  const goDocument = useCallback(
    (inventoryStatus: string, sku: string, variantName: string, store_id?: number) => {
      let linkDocument = "";
      let store_ids = undefined;
      if (store_id) {
        store_ids = store_id;
      }

      switch (inventoryStatus) {
        case EInventoryStatus.COMMITTED:
          linkDocument = `${
            UrlConfig.ORDER
          }?page=1&limit=30&is_online=true&sub_status_code=awaiting_shipper%2Cmerchandise_packed%2Cmerchandise_picking%2Ccoordinator_confirmed%2Ccoordinator_confirming%2Cawaiting_saler_confirmation%2Cawaiting_coordinator_confirmation%2Cfirst_call_attempt%2Csecond_call_attempt%2Cthird_call_attempt%2Crequire_warehouse_change&channel_codes=FB%2CWEBSITE%2CMOBILE_APP%2CLANDING_PAGE%2CADMIN%2CWEB%2CZALO%2CINSTAGRAM%2CTIKTOK
        ${store_ids ? `&store_ids=${store_ids}` : ""}&searched_product=${variantName}`;
          break;
        case EInventoryStatus.IN_COMING:
          linkDocument = `${UrlConfig.PROCUREMENT}/products?page=1&limit=30${
            store_ids ? `&stores=${store_ids}` : ""
          }&content=${sku}`;
          break;
        case EInventoryStatus.ON_HOLD:
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}?page=1&limit=30&simple=true${
            store_ids ? `&from_store_id=${store_ids}` : ""
          }&condition=${sku}&status=confirmed`;
          break;
        case EInventoryStatus.ON_WAY:
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}?page=1&limit=30&simple=true${
            store_ids ? `&from_store_id=${store_ids}` : ""
          }&condition=${sku}&status=transferring`;
          break;
        case EInventoryStatus.TRANSFERRING:
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}?page=1&limit=30&simple=true${
            store_ids ? `&to_store_id=${store_ids}` : ""
          }&condition=${sku}&status=transferring`;
          break;
        default:
          break;
      }
      return linkDocument;
    },
    [],
  );

  return (
    <div>
      <CustomTable
        className="small-padding"
        dataSource={data.items}
        pagination={false}
        isLoading={loadingInventories}
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
            render: (value) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
          {
            align: "center",
            title: "Chờ nhập",
            dataIndex: "in_coming",
            render: (value: number, record: InventoryResponse) => {
              return (
                <div>
                  {" "}
                  {value ? (
                    <Link
                      target="_blank"
                      to={goDocument(
                        EInventoryStatus.IN_COMING,
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
            render: (value) => {
              return value ? formatCurrencyForProduct(value) : "";
            },
          },
        ]}
      />
    </div>
  );
};

export default TabProductInventory;
