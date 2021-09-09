import CustomTable from "component/table/CustomTable";
import { useState } from "react";
import actionColumn from "../../actions/action.column";
import { StyledHeader } from "./styles";
import { Checkbox } from "antd";
import tikiIcon from "assets/icon/tiki.svg";
import shopeeIcon from "assets/icon/shopee.svg";

const SyncEcommerce: React.FC<any> = (props: any) => {
  const handleEdit = () => {};
  const handleDisconnect = () => {};

  const [columns] = useState<any>([
    { title: "STT", visible: true, dataIndex: "index" },
    {
      title: "Sàn TMĐT",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return <img src={v.img} alt=""></img>;
      },
    },
    { title: "Shop ID | Tên shop", visible: true, dataIndex: "shop_id" },
    { title: "Tên gian hàng", visible: true, dataIndex: "shop_name" },
    { title: "Cửa hàng", visible: true, dataIndex: "branch_name" },
    { title: "Cập nhật tồn kho", visible: true, dataIndex: "remaining_update" },
    { title: "Đồng bộ sản phẩm", visible: true, dataIndex: "product_sync" },
    { title: "Đồng bộ đơn hàng", visible: true, dataIndex: "orders_sync" },
    { title: "Nhân viên bán hàng", visible: true, dataIndex: "seller" },
    actionColumn(handleEdit, handleDisconnect),
  ]);

  const [dataMock] = useState<any>([
    {
      img: shopeeIcon,
      shop_id: "YD6969",
      shop_name: "YODY OFFICIAL",
      branch_name: "The Sun",
      remaining_update: "Tự động",
      product_sync: "Đợi ghép nối",
      orders_sync: "Tự động",
      seller: "Lê Văn Duy",
    },
  ]);

  return (
    <div className="padding-20">
      <StyledHeader>
        <div>
          <Checkbox />
          <img src={tikiIcon} alt="tiki"></img>
          <span>Sàn Tiki</span>
        </div>
        <div>
          <Checkbox />
          <img src={shopeeIcon} alt="shopee"></img>
          <span>Sàn Shopee</span>
        </div>
      </StyledHeader>
      <CustomTable
        columns={columns}
        dataSource={dataMock}
        pagination={false}
        // pagination={{
        //   pageSize: data.metadata.limit,
        //   total: data.metadata.total,
        //   current: data.metadata.page,
        //   showSizeChanger: true,
        //   onChange: onPageChange,
        //   onShowSizeChange: onPageChange,
        // }}
        rowKey={(data) => data.shop_id}
      />
    </div>
  );
};

export default SyncEcommerce;
