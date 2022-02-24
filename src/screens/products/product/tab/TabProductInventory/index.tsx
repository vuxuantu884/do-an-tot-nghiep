import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";

interface IProps {
  data: PageResponse<InventoryResponse>;
  onChange: (page: number, pageSize?: number) => void
}

const TabProductInventory: React.FC<IProps> = (props: IProps) => {
  const { data, onChange } = props;
  return (
    <div>
      <CustomTable
        className="small-padding"
        dataSource={data.items}
        pagination={{
          total: data.metadata.total,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          onChange: onChange
        }}
        sticky={{offsetHeader: 55, offsetScroll: 10}}
        rowKey={(record) => record.id}
        columns={[
          {
            title: "Kho hàng",
            dataIndex: "store",
          },
          {
            align: "right",
            title: "Tổng tồn",
            dataIndex: "total_stock",
          },
          {
            align: "right",
            title: "Tồn trong kho",
            dataIndex: "on_hand",
          },
          {
            align: "right",
            title: "Đang giao dịch",
            dataIndex: "committed",
          },
          {
            align: "right",
            title: "Có thể bán",
            dataIndex: "available",
          },
          {
            align: "right",
            title: "Tạm giữ",
            dataIndex: "on_hold",
          },
          {
            align: "right",
            title: "Hàng lỗi",
            dataIndex: "defect",
          },
          {
            align: "right",
            title: "Chờ nhập",
            dataIndex: "in_coming",
          },
          {
            align: "right",
            title: "Đang chuyển đến",
            dataIndex: "transferring",
          },
          {
            align: "right",
            title: "Đang chuyển đi",

            dataIndex: "on_way",
          },
          {
            align: "right",
            title: "Hàng đang giao",
            dataIndex: "shipping",
          },
        ]}
      />
    </div>
  );
};

export default TabProductInventory;
