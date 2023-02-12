import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryResponse } from "model/inventory";
import { Link } from "react-router-dom";
import { formatCurrencyForProduct, ProductHistoryDocumentTypes } from "screens/products/helper";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import React from "react";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

type TabProductHistoryProps = {
  data: PageResponse<HistoryInventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
  isLoadingHis?: boolean;
};

const TabProductHistory: React.FC<TabProductHistoryProps> = (props: TabProductHistoryProps) => {
  const { data, onChange, isLoadingHis } = props;

  const getUrlByDocumentType = (type: string) => {
    switch (type) {
      case ProductHistoryDocumentTypes.ORDER:
        return UrlConfig.ORDER;
      case ProductHistoryDocumentTypes.RETURN_ORDER:
        return UrlConfig.ORDERS_RETURN;
      case ProductHistoryDocumentTypes.PURCHASE_ORDER:
      case ProductHistoryDocumentTypes.RETURN_PO:
        return UrlConfig.PURCHASE_ORDERS;
      case ProductHistoryDocumentTypes.INVENTORY_TRANSFER:
        return UrlConfig.INVENTORY_TRANSFERS;
      case ProductHistoryDocumentTypes.INVENTORY_ADJUSTMENT:
        return UrlConfig.INVENTORY_ADJUSTMENTS;
      case ProductHistoryDocumentTypes.OTHER_STOCK_IN_OUT:
        return UrlConfig.STOCK_IN_OUT_OTHERS;
      default:
        return type;
    }
  };
  return (
    <div>
      <CustomTable
        isLoading={isLoadingHis}
        className="small-padding"
        dataSource={data.items}
        pagination={{
          total: data.metadata.total,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          onChange: onChange,
        }}
        sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR, offsetScroll: 10 }}
        rowKey={(record) => record.id}
        columns={[
          {
            title: "Mã chứng từ",
            dataIndex: "code",
            render: (value, record: HistoryInventoryResponse) => {
              let id = record.parent_document_id;
              if (record.document_type === ProductHistoryDocumentTypes.RETURN_ORDER) {
                id = record.document_id;
              }

              return (
                <div>
                  <Link to={`${getUrlByDocumentType(record.document_type)}/${id}`}>{value}</Link>
                </div>
              );
            },
          },
          {
            title: "Thao tác",
            dataIndex: "action",
            align: "left",
          },
          {
            title: "Thời gian",
            dataIndex: "transaction_date",
            render: (value) => ConvertUtcToLocalDate(value),
            align: "left",
            width: 120,
          },
          {
            title: "SL Thay đổi",
            dataIndex: "quantity",
            align: "center",
            render: (value) =>
              parseInt(value) > 0
                ? `+${formatCurrencyForProduct(value)}`
                : formatCurrencyForProduct(value),
          },
          {
            title: "Tồn trong kho",
            dataIndex: "on_hand",
            align: "center",
            render: (value) => {
              return formatCurrencyForProduct(value);
            },
          },
          {
            title: "Kho hàng",
            dataIndex: "store",
            align: "center",
          },
          {
            align: "center",
            title: "Người sửa",
            dataIndex: "updated_by",
          },
        ]}
      />
    </div>
  );
};

export default TabProductHistory;
