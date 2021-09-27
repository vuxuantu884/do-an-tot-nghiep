import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryResponse } from "model/inventory";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

interface IProps {
  data: PageResponse<HistoryInventoryResponse>;
  onChange: (page: number, pageSize?: number) => void;
}
const TabProductHistory: React.FC<IProps> = (props: IProps) => {
  const { data, onChange } = props;
  return (
    <div className="padding-20">
      <CustomTable
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
            title: "Id chứng từ",
            dataIndex: "document_code",
          },
          {
            title: "Thời gian",
            dataIndex: "transaction_date",
            render: (value) => ConvertUtcToLocalDate(value),
            align: 'center',
          },
          {
            title: "SL Thay đổi",
            dataIndex: "quantity",
            align: 'center',
          },
          {
            title: "Tồn trong kho",
            dataIndex: "on_hand",
            align: 'center',
          },
          {
            title: "Giá",
            dataIndex: "retail_price",
            align: 'center',
          },
          {
            title: "Chiết khấu",
            dataIndex: "total_discount",
            align: 'center',
          },
          {
            title: "Tổng tiền",
            dataIndex: "total",
            align: 'center',
          },
          {
            title: "Kho hàng",
            dataIndex: "store",
            align: 'center',
          },
        ]}
      />
    </div>
  );
};

export default TabProductHistory;
