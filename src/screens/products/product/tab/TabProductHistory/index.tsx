import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryResponse } from "model/inventory";
import { Link } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

interface IProps {
  data: PageResponse<HistoryInventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
}
enum DocumentType {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
}

const TabProductHistory: React.FC<IProps> = (props: IProps) => {
  const { data, onChange } = props;

  const getUrlByDocumentType = (type: string) => {
    switch (type) {
      case DocumentType.ORDER:
        return UrlConfig.ORDER;
      case DocumentType.RETURN_ORDER:
        return UrlConfig.ORDERS_RETURN;
      case DocumentType.PURCHASE_ORDER:
      case DocumentType.RETURN_PO:
        return UrlConfig.PURCHASE_ORDERS;
      default:
        return type;
    }
  };
  return (
    <div>
      <CustomTable
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
                  <Link to={`${getUrlByDocumentType(record.document_type)}/${id}`}>
                    {value}
                  </Link>
                </div>
              );
            },
          },
          {
            title: 'Thao tác',
            dataIndex: "action",
            align: 'left',
          },
          {
            title: "Thời gian",
            dataIndex: "transaction_date",
            render: (value) => ConvertUtcToLocalDate(value),
            align: 'left',
            width: 120
          },
          {
            title: "SL Thay đổi",
            dataIndex: "quantity",
            align: 'center',
            render: (value)=> parseInt(value) >0 ? `+${value}` : value 
          },
          {
            title: "Tồn trong kho",
            dataIndex: "on_hand",
            align: 'center',
          },
          {
            title: "Kho hàng",
            dataIndex: "store",
            align: 'center',
          },
          {
            align: 'center',
            title: 'Người sửa',
            dataIndex: 'updated_by',
          },
        ]}
      />
    </div>
  );
};

export default TabProductHistory;
