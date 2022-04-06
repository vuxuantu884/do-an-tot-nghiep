import React, { useState } from "react";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import CustomTable from "component/table/CustomTable";
import actionColumn from "screens/web-app/config/actions/action.column";
import { useHistory } from "react-router-dom";
import { StyledComponent } from "screens/web-app/config/shop-list/StyledSyncShopList";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import {getWebAppById} from "screens/web-app/common/commonAction";
import {WebAppConfigTabUrl} from "config/url.config";

type SyncShopListProps = {
  configData: any;
  setConfigToView: (value: WebAppResponse) => void;
  reloadConfigData: () => void;
  showDeleteModal: (value: WebAppResponse) => void;
};

const SyncShopList: React.FC<SyncShopListProps> = (
  props: SyncShopListProps
) => {
  const { configData, setConfigToView, showDeleteModal } = props;
  const history = useHistory();

  const handleUpdate = (item: any) => {
    setConfigToView(item);
    history.push(`${WebAppConfigTabUrl.CONFIG_SHOP}`);
  };

  const handleShowDeleteModal = (item: WebAppResponse) => {
    showDeleteModal(item);
  };

  const [columns] = useState<any>([
    {
      title: "STT",
      align: "center",
      width: "70px",
      fixed: "left",
      render: (l: any, v: any, i: any) => {
        return <span>{i + 1}</span>
      }
    },
    {
      title: "Shop ID | Tên shop",
      width: "20%",
      fixed: "left",
      render: (value: any, data: any) => {
        return (
          <div style={{ display: "flex" }}>
            <strong className="link" onClick={() => handleUpdate(data)}>{data.name}</strong>
          </div>
        )
      }
    },
    {
      title: "Tên gian hàng",
      // width: "20%",
      dataIndex: "ecommerce_id",
      render: (value: any) => (
        <div className="shop-show-style" style={{ textAlign: "left", minWidth:"150px"}}>
          {getWebAppById(value)?.title}
        </div>

      ),
    },
    {
      title: "Cửa hàng",
      width: "20%",
      dataIndex: "store"
    },
    {
      title: "Ngày kết nối",
      dataIndex: "created_date",
      width: 120,
      align: "center",
      render: (value: string) => {
        return (
          <div>{ConvertUtcToLocalDate(value, "DD/MM/YYYY")}</div>
        )
      }
    },
    actionColumn(handleUpdate, handleShowDeleteModal),
  ]);


  return (
    <StyledComponent>
      <div>
        <CustomTable
          bordered
          columns={columns}
          dataSource={configData}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
          pagination={false}
          rowKey={(data) => data.id}
        />
      </div>
    </StyledComponent>
  );
};

export default SyncShopList;
