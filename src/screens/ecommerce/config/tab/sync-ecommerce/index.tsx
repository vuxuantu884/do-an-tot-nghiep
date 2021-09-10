import CustomTable from "component/table/CustomTable";
import React, { useState } from "react";
import actionColumn from "../../actions/action.column";
import { StyledHeader } from "./styles";
import { Button } from "antd";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import { useHistory } from "react-router-dom";
// import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";

const SyncEcommerce: React.FC<any> = (props: any) => {
  const { dataMock, setConfigToView } = props;
  const history = useHistory();
  const [activatedBtn, setActivatedBtn] = React.useState({
      title: "",
      icon: "",
      id: "",
      isActive: "",
      key: null,
  })
  const handleUpdate = (item: any) => {
    setConfigToView(item)
    history.replace(`${history.location.pathname}#setting`)
  }

  const handleDisconnect = () => {};

  const [columns] = useState<any>([
    {
      title: "STT",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return <span>{i + 1}</span>
      },
    },
    {
      title: "Sàn TMĐT",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return <img src={v.img} alt=""></img>;
      },
    },
    { title: "Shop ID | Tên shop", visible: true, dataIndex: "name" },
    { title: "Tên gian hàng", visible: true, dataIndex: "name" },
    // { title: "Cửa hàng", visible: true, dataIndex: "store_id" },
    { title: "Đồng bộ sản phẩm", visible: true, dataIndex: "product_sync" },
    { title: "Nhân viên bán hàng", visible: true, dataIndex: "assign_account" },
    { title: "Ngày kết nối", visible: true, dataIndex: "auth_time" },
    actionColumn(handleUpdate, handleDisconnect),
  ]);

  const [buttons] = useState<Array<any>>([
    {
      title: "Tất cả các sàn",
      icon: "",
      id: "all",
      isActive: true,
      key: 1,
    },
    {
      title: "Sàn Tiki",
      icon: tikiIcon,
      id: "tiki",
      isActive: false,
      key: 2,
    },
    {
      title: "Sàn Shopee",
      icon: shopeeIcon,
      id: "shopee",
      isActive: false,
      key: 3,
    },
    {
      title: "Sàn Lazada",
      icon: lazadaIcon,
      id: "lazada",
      isActive: false,
      key: 4,
    },
    {
      title: "Sàn Sendo",
      icon: sendoIcon,
      id: "sendo",
      isActive: false,
      key: 5,
    },
  ]);


  const handleBtnClick = (button: any) => {
    setActivatedBtn(button)
  };
  return (
    <div className="padding-20">
      <StyledHeader>
        {buttons.map((button) => (
          <Button
            key={button.id}
            className={button.key === activatedBtn?.key ? "active-button" : ""}
            icon={button.icon && <img src={button.icon} alt={button.id} />}
            type="ghost"
            onClick={() => handleBtnClick(button)}
          >
            {button.title}
          </Button>
        ))}

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
