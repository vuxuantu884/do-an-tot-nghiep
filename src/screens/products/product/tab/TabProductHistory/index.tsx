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
    <div>
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
            title: "Mã chứng từ",
            dataIndex: "code",
          },
          {
            title: 'Thao tác',
            dataIndex: "action",
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
