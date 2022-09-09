import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryResponse } from "model/inventory";
import { Link } from "react-router-dom";
import { formatCurrencyForProduct } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

interface IProps {
  data: PageResponse<HistoryInventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
  loadingHis?: boolean;
}
enum DocumentType {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
  INVENTORY_TRANSFER = "inventory_transfer",
  INVENTORY_ADJUSTMENT = "inventory_adjustment",
  OTHER_STOCK_IN_OUT = "other_stock_in_out",
}

const TabProductHistory: React.FC<IProps> = (props: IProps) => {
  const { data, onChange, loadingHis } = props;

  const getUrlByDocumentType = (type: string) => {
    switch (type) {
      case DocumentType.ORDER:
        return UrlConfig.ORDER;
      case DocumentType.RETURN_ORDER:
        return UrlConfig.ORDERS_RETURN;
      case DocumentType.PURCHASE_ORDER:
      case DocumentType.RETURN_PO:
        return UrlConfig.PURCHASE_ORDERS;
      case DocumentType.INVENTORY_TRANSFER:
        return UrlConfig.INVENTORY_TRANSFERS;
      case DocumentType.INVENTORY_ADJUSTMENT:
        return UrlConfig.INVENTORY_ADJUSTMENTS;
      case DocumentType.OTHER_STOCK_IN_OUT:
        return UrlConfig.STOCK_IN_OUT_OTHERS;
      default:
        return type;
    }
  };
  return (
    <div>
      <CustomTable
        isLoading={loadingHis}
        className="small-padding"
        dataSource={data.items}
        pagination={{
          total: data.metadata.total,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          onChange: onChange,
        }}
        sticky={{ offsetHeader: 55, offsetScroll: 10 }}
        rowKey={(record) => record.id}
        columns={[
          {
            title: "Mã chứng từ",
            dataIndex: "code",
            render: (value, record: HistoryInventoryResponse) => {
              let id = record.parent_document_id;
              if (record.document_type === DocumentType.RETURN_ORDER) {
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
