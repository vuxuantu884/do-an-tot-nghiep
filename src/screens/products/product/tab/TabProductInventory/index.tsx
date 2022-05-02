import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";

interface IProps {
  data: PageResponse<InventoryResponse>;
  onChange: (page: number, pageSize?: number) => void
}

const TabProductInventory: React.FC<IProps> = (props: IProps) => {
  const { data } = props;
  return (
    <div>
      <CustomTable
        className="small-padding"
        dataSource={data.items}
        pagination={false}        
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
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Tồn trong kho",
            dataIndex: "on_hand",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Đang giao dịch",
            dataIndex: "committed",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Có thể bán",
            dataIndex: "available",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Tạm giữ",
            dataIndex: "on_hold",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Hàng lỗi",
            dataIndex: "defect",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Chờ nhập",
            dataIndex: "in_coming",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Đang chuyển đến",
            dataIndex: "transferring",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Đang chuyển đi",
            dataIndex: "on_way",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
          {
            align: "right",
            title: "Hàng đang giao",
            dataIndex: "shipping",
            render: (value)=>{
              return value===0 ? "": value;
            }
          },
        ]}
      />
    </div>
  );
};

export default TabProductInventory;
