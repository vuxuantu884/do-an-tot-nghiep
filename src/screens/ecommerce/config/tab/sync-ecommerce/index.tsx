import CustomTable from "component/table/CustomTable";
import React, { useState } from "react";
import actionColumn from "../../actions/action.column";
import { StyledHeader, StyledComponent } from "./styles";
import { Button } from "antd";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import { useHistory } from "react-router-dom";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import successIcon from "assets/icon/success_2.svg";
import moment from "moment";

const iconMap: any = {
  shopee: shopeeIcon,
  lazada: lazadaIcon,
  tiki: tikiIcon,
  sendo: sendoIcon,
};
type SyncEcommerceProps = {
  configData: any;
  setConfigToView: (value: EcommerceResponse) => void;
  reloadConfigData: () => void;
  showDeleteModal: (value: EcommerceResponse) => void;
};

const SyncEcommerce: React.FC<SyncEcommerceProps> = (
  props: SyncEcommerceProps
) => {
  const { configData, setConfigToView, showDeleteModal } = props;
  const history = useHistory();
  const [activatedBtn, setActivatedBtn] = React.useState({
    title: "",
    icon: "",
    id: "all",
    isActive: "",
    key: 1,
  });

  const handleUpdate = (item: any) => {
    setConfigToView(item);
    history.replace(`${history.location.pathname}#setting`);
  };

  const handleShowDeleteModal = (item: EcommerceResponse) => {
    showDeleteModal(item);
  };

  const [columns] = useState<any>([
    {
      title: "STT",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <span>{i + 1}</span>;
      },
    },
    {
      title: "Sàn TMĐT",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <img src={iconMap[v.ecommerce]} alt=""></img>;
      },
    },
    // {
    //   title: "Shop ID | Tên shop",
    //   visible: true,
    //   render: (l: any, v: any, i: any) => {
    //     return <div>
    //       <span>{v.ecommerce_id}</span>
    //       <span>{v.ecommerce}</span>
    //     </div>;
    //   },
    // },
    {
      title: "Tên gian hàng",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span
            style={{ color: " #2a2a86", cursor: "pointer" }}
            onClick={() => handleUpdate(v)}
          >
            {v.name}
          </span>
        );
      },
    },
    { title: "Cửa hàng", visible: true, dataIndex: "store" },
    // {
    //   title: "Đồng bộ sản phẩm",
    //   visible: true,
    //   align: "center",
    //   dataIndex: "product_sync",
    // },
    {
      title: "Nhân viên bán hàng",
      visible: true,
      align: "center",
      dataIndex: "assign_account",
    },
    {
      title: "Ngày kết nối",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>{moment.unix(v.auth_time).format("DD/MM/YYYY HH:mm:ss")}</span>
        );
      },
    },
    actionColumn(handleUpdate, handleShowDeleteModal),
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

  const configDataFiltered =
    configData &&
    configData?.filter((item: any) => {
      if (activatedBtn?.id === "all") {
        return true;
      } else {
        return item.ecommerce === activatedBtn.id;
      }
    });

  return (
    <StyledComponent>
      <div className="padding-20">
        <StyledHeader>
          {buttons.map((button) => (
            <Button
              key={button.id}
              className={
                button.key === activatedBtn?.key ? "active-button" : ""
              }
              icon={button.icon && <img src={button.icon} alt={button.id} />}
              type="ghost"
              onClick={() => setActivatedBtn(button)}
            >
              {button.title}
              {button.key === activatedBtn?.key && (
                <img src={successIcon} className="icon-active-button" alt="" />
              )}
            </Button>
          ))}
        </StyledHeader>
        <CustomTable
          columns={columns}
          dataSource={configDataFiltered}
          pagination={false}
          // pagination={{
          //   pageSize: data.metadata.limit,
          //   total: data.metadata.total,
          //   current: data.metadata.page,
          //   showSizeChanger: true,
          //   onChange: onPageChange,
          //   onShowSizeChange: onPageChange,
          // }}
          rowKey={(data) => data.id}
        />
      </div>
    </StyledComponent>
  );
};

export default SyncEcommerce;
