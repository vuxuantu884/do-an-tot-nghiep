import React, { useCallback, useMemo, useState } from "react";
import { Button } from "antd";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import CustomTable from "component/table/CustomTable";
import actionColumn from "screens/ecommerce/config/actions/action.column";
import { useHistory } from "react-router-dom";
import successIcon from "assets/icon/success_2.svg";
import { ECOMMERCE_ICON, ECOMMERCE_ID } from "screens/ecommerce/common/commonAction";
import {
  StyledHeader,
  StyledComponent,
} from "screens/ecommerce/config/shop-list/StyledSyncShopList";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { SourceResponse } from "model/response/order/source.response";

type SyncShopListProps = {
  configData: any;
  sourceList: Array<SourceResponse>;
  setConfigToView: (value: EcommerceResponse) => void;
  reloadConfigData: () => void;
  showDeleteModal: (value: EcommerceResponse) => void;
};

const SYNC_TYPE = [
  {
    value: "manual",
    name: "Thủ công",
  },
  {
    value: "auto",
    name: "Tự động",
  },
];

const SyncShopList: React.FC<SyncShopListProps> = (props: SyncShopListProps) => {
  const { configData, sourceList, setConfigToView, showDeleteModal } = props;
  const history = useHistory();
  const [activatedBtn, setActivatedBtn] = React.useState({
    title: "",
    icon: "",
    id: "all",
    isActive: "",
    key: 0,
  });

  const handleUpdate = useCallback(
    (item: any) => {
      setConfigToView(item);
      history.replace(`${history.location.pathname}#setting`);
    },
    [history, setConfigToView],
  );

  const handleShowDeleteModal = useCallback(
    (item: EcommerceResponse) => {
      showDeleteModal(item);
    },
    [showDeleteModal],
  );

  const getSourceNameById = useCallback(
    (sourceId: number) => {
      const source = sourceList.find((item) => Number(item.id) === Number(sourceId));
      return source ? source.name : "";
    },
    [sourceList],
  );

  const columns: any = useMemo(() => {
    return [
      {
        title: "STT",
        align: "center",
        width: "70px",
        fixed: "left",
        render: (l: any, v: any, i: any) => {
          return <span>{i + 1}</span>;
        },
      },
      {
        title: "Gian hàng",
        width: "10%",
        fixed: "left",
        render: (value: any, data: any) => {
          return (
            <div style={{ display: "flex" }}>
              <img
                src={ECOMMERCE_ICON[data.ecommerce?.toLowerCase()]}
                alt=""
                style={{ marginRight: 8 }}
              />
              <strong className="link" onClick={() => handleUpdate(data)}>
                {data.name}
              </strong>
            </div>
          );
        },
      },
      {
        title: "Tên shop (Sàn)",
        width: "10%",
        dataIndex: "ecommerce_shop",
      },
      {
        title: "Cửa hàng",
        width: "10%",
        dataIndex: "store",
        render: (value: any, data: any) => {
          let storeValue = value;
          if (data.ecommerce_id !== ECOMMERCE_ID.SHOPEE) {
            storeValue = "Đa kho";
          }
          return <div>{storeValue}</div>;
        },
      },
      {
        title: "Kho đồng bộ tồn",
        // width: "20%",
        render: (value: any, data: any) => {
          let inventories = "";
          data.inventories?.forEach((item: any) => {
            if (value?.ecommerce_id !== ECOMMERCE_ID.SHOPEE) {
              inventories = "Đa kho";
            } else {
              inventories = item.deleted ? inventories : inventories + item.store + ", ";
            }
          });
          return <div>{inventories}</div>;
        },
      },
      {
        title: "Nguồn đơn hàng",
        width: "10%",
        dataIndex: "source_id",
        render: (source_id: number) => {
          const sourceName = getSourceNameById(source_id);
          return <div>{sourceName}</div>;
        },
      },
      {
        title: "Kiểu đồng bộ tồn",
        dataIndex: "inventory_sync",
        align: "center",
        width: 150,
        render: (value: string) => {
          const inventorySyncType = SYNC_TYPE.find((item: any) => item.value === value);
          return <div>{inventorySyncType?.name}</div>;
        },
      },
      {
        title: "Kiểu đồng bộ đơn hàng",
        dataIndex: "order_sync",
        align: "center",
        width: 150,
        render: (value: string) => {
          const orderSyncType = SYNC_TYPE.find((item: any) => item.value === value);
          return <div>{orderSyncType?.name}</div>;
        },
      },
      {
        title: "Kiểu sản phẩm khi tải đơn về",
        dataIndex: "product_sync",
        align: "center",
        width: 150,
        render: () => {
          return <div>Đợi ghép nối</div>;
        },
      },
      {
        title: "Nhân viên bán hàng",
        width: "10%",
        dataIndex: "assign_account",
      },
      {
        title: "Ngày kết nối",
        dataIndex: "created_date",
        width: 120,
        align: "center",
        render: (value: string) => {
          return <div>{ConvertUtcToLocalDate(value, "DD/MM/YYYY")}</div>;
        },
      },
      actionColumn(handleUpdate, handleShowDeleteModal),
    ];
  }, [getSourceNameById, handleShowDeleteModal, handleUpdate]);

  const [buttons] = useState<Array<any>>([
    {
      title: "Tất cả các sàn",
      icon: "",
      id: "all",
      isActive: true,
      key: 0,
    },
    {
      title: "Sàn Shopee",
      icon: ECOMMERCE_ICON.shopee,
      id: "shopee",
      isActive: false,
      key: 1,
    },
    {
      title: "Sàn Lazada",
      icon: ECOMMERCE_ICON.lazada,
      id: "lazada",
      isActive: false,
      key: 2,
    },
    {
      title: "Sàn Tiki",
      icon: ECOMMERCE_ICON.tiki,
      id: "tiki",
      isActive: false,
      key: 3,
    },

    {
      title: "Sàn Tiktok",
      icon: ECOMMERCE_ICON.tiktok,
      id: "tiktok",
      isActive: false,
      key: 4,
    },
  ]);

  const configDataFiltered =
    configData &&
    configData?.filter((item: any) => {
      if (activatedBtn?.id === "all") {
        return true;
      } else {
        return item.ecommerce_id === activatedBtn.key;
      }
    });

  return (
    <StyledComponent>
      <div>
        <StyledHeader>
          {buttons.map((button) => (
            <Button
              key={button.id}
              className={button.key === activatedBtn?.key ? "active-button" : ""}
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
          bordered
          columns={columns}
          dataSource={configDataFiltered}
          scroll={{ x: 2000 }}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
          pagination={false}
          rowKey={(data) => data.id}
        />
      </div>
    </StyledComponent>
  );
};

export default SyncShopList;
