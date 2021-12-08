import React, { useState } from "react";
import { Button } from "antd";
import moment from "moment";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import CustomTable from "component/table/CustomTable";
import actionColumn from "screens/ecommerce/config/actions/action.column";
import { useHistory } from "react-router-dom";
import successIcon from "assets/icon/success_2.svg";
import iconMap from "screens/ecommerce/common/ecommerce-icon";
import { StyledHeader, StyledComponent } from "screens/ecommerce/config/tab/sync-ecommerce/styles";

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
        return <img src={iconMap[v.ecommerce.toLowerCase()]} alt=""/>;
      },
    },
    {
      title: "Tên gian hàng",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span className="link" onClick={() => handleUpdate(v)}>
            {v.name}
          </span>
        );
      },
    },
    { title: "Cửa hàng", visible: true, dataIndex: "store" },
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
      icon: iconMap.tiki,
      id: "tiki",
      isActive: false,
      key: 2,
    },
    {
      title: "Sàn Shopee",
      icon: iconMap.shopee,
      id: "shopee",
      isActive: false,
      key: 3,
    },
    {
      title: "Sàn Lazada",
      icon: iconMap.lazada,
      id: "lazada",
      isActive: false,
      key: 4,
    },
    {
      title: "Sàn Sendo",
      icon: iconMap.sendo,
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
          rowKey={(data) => data.id}
        />
      </div>
    </StyledComponent>
  );
};

export default SyncEcommerce;
