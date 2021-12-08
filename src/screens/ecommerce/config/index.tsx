import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Tabs, Form, Button, Dropdown, Menu, Modal } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";

import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { ecommerceConfigGetAction } from "domain/actions/ecommerce/ecommerce.actions";
import { useQuery } from "utils/useQuery";
import { EcommerceSearchQuery } from "model/request/ecommerce.request";
import {
  ecommerceConnectAction,
  ecommerceConfigInfoAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import EcommerceModal from "screens/ecommerce/common/ecommerce-custom-modal";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { ecommerceConfigDeleteAction } from "domain/actions/ecommerce/ecommerce.actions"

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import useAuthorization from "hook/useAuthorization";

import SyncEcommerce from "screens/ecommerce/config/tab/sync-ecommerce"
import SettingConfig from "screens/ecommerce/config/tab/setting-config";

import { StyledComponent, StyledConfirmUpdateShopModal } from "screens/ecommerce/config/styles";
import { DownOutlined } from "@ant-design/icons";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import connectedShopIcon from "assets/icon/connected_shop.svg";


const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};
let isConnectedShop = false;
let connectedShopList: Array<EcommerceResponse> = [];

const shopsReadPermission = [EcommerceConfigPermission.shops_read];
const shopsConnectPermission = [EcommerceConfigPermission.shops_connect];


const EcommerceConfig: React.FC = () => {
  const dispatch = useDispatch();
  const connectQuery = useQuery();
  const [configForm] = Form.useForm();

  const [allowShopsConnect] = useAuthorization({
    acceptPermissions: shopsConnectPermission,
    not: false,
  });


  const [activeTab, setActiveTab] = useState<string>("sync");
  const history = useHistory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [configData, setConfigData] = React.useState<Array<EcommerceResponse>>(
    []
  );
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false)
  const [configToView, setConfigToView] = React.useState<EcommerceResponse | undefined>();
  const [initQueryConnect] = React.useState<EcommerceSearchQuery>({
    shop_id: connectQuery.get("shop_id") || "",
    code: connectQuery.get("code"),
  });
  const [isGetAllShop, setIsGetAllShop] = React.useState(false);
  const [configFromEcommerce, setConfigFromEcommerce] = React.useState<EcommerceResponse | undefined>()
  const [modalShopInfo, setModalShopInfo] = React.useState<EcommerceResponse>()
  const [isConfirmUpdateShop, setIsConfirmUpdateShop] = useState(false);

  const reloadConfigData = React.useCallback(() => {
    setIsLoading(true);
    dispatch(ecommerceConfigGetAction((responseData) => {
      setIsLoading(false);
      setConfigData(responseData);
    }));
  }, [dispatch])

  const handleShowDeleteModal = (item: any) => {
    setModalShopInfo(item)
    setIsShowDeleteModal(true)
  }
  const deleteCallback = React.useCallback((value: any) => {
    if (value) {
      showSuccess("Xóa gian hàng thành công")
      reloadConfigData()
      setConfigToView(undefined);
      history.replace(`${history.location.pathname}#sync`);
    }
  }, [reloadConfigData, history])

  const onOkDeleteEcommerce = React.useCallback(() => {
    setIsShowDeleteModal(false)
    if (modalShopInfo) dispatch(ecommerceConfigDeleteAction(modalShopInfo?.id, deleteCallback))
  }, [deleteCallback, dispatch, modalShopInfo])


  const storeChangeSearch = React.useCallback(() => { }, []);

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      const _items = data.items.filter((item) => item.status === "active");
      setAccounts(_items);
    },
    []
  );

  // link to ecommerce
  const redirectCallback = React.useCallback((value: any) => {
    if (value) {
      window.open(`${value}`, "_self");
    }
  }, []);

  const handleConnectEcommerce = React.useCallback((ecommerceId) => {
    dispatch(ecommerceConnectAction(ecommerceId, redirectCallback));
  }, [dispatch, redirectCallback]);

  const ECOMMERCE_ID = {
    shopee: 1,
    lazada: 2,
    tiki: 3,
    sendo: 4
  }

  // tiki
  const handleConnectTiki = React.useCallback(() => {
    showWarning("Chức năng này làm sau bạn nhé!");
  }, []);
  // end

  // shopee
  const handleConnectShopee = React.useCallback(() => {
    handleConnectEcommerce(ECOMMERCE_ID.shopee);
  }, [ECOMMERCE_ID.shopee, handleConnectEcommerce]);
  // end

  
  // lazada
  const handleConnectLazada = React.useCallback(() => {
    handleConnectEcommerce(ECOMMERCE_ID.lazada);
  }, [ECOMMERCE_ID.lazada, handleConnectEcommerce]);
  //end

  // lazada
  const handleConnectSendo = React.useCallback(() => {
    showWarning("Chức năng này làm sau bạn nhé!");
  }, []);
  //end
  // end link to ecommerce

  // get all ecommerce
  React.useEffect(() => {
    setIsLoading(true);
    dispatch(ecommerceConfigGetAction((responseData) => {
      setIsLoading(false);
      setIsGetAllShop(true);
      setConfigData(responseData);
      connectedShopList = responseData;
    }));
  }, [dispatch]);
  //end

  const configInfoCallback = React.useCallback(
    (data: any) => {
      if (data) {
        setConfigFromEcommerce(data);
        const shop = connectedShopList?.find((item: any) => item.id === data.id);
        if (shop) {
          setIsConfirmUpdateShop(true);
        } else {
          history.replace(`${history.location.pathname}#setting`);
        }
      }
    },
    [history]
  );

  //listening callback after connect shop
  React.useEffect(() => {
    if (initQueryConnect.code && !isConnectedShop && isGetAllShop) {
      isConnectedShop = true;
      const generatedParams = `shop_id=${initQueryConnect.shop_id}&code=${initQueryConnect.code}`;
      dispatch(ecommerceConfigInfoAction(generatedParams, configInfoCallback));
    }
  }, [initQueryConnect, configInfoCallback, dispatch, isGetAllShop]);
  
  const accountChangeSearch = React.useCallback(
    (value) => {
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
    },
    [dispatch, setDataAccounts]
  );

  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  React.useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setStores(stores);
      })
    );
  }, [dispatch]);

  React.useEffect(() => {
    if (history.location.hash) {
      switch (history.location.hash) {
        case "#sync":
          setActiveTab("sync");
          break;
        case "#setting":
          setActiveTab("setting");
          break;
      }
    }
  }, [history.location.hash]);

  //Thêm kết nối sàn mới
  const ECOMMERCE_LIST = useMemo(() => [
    {
      title: "Kết nối Tiki",
      icon: tikiIcon,
      key: "tiki",
      action: handleConnectTiki
    },
    {
      title: "Kết nối Shopee",
      icon: shopeeIcon,
      key: "shopee",
      action: handleConnectShopee
    },
    {
      title: "Kết nối Lazada",
      icon: lazadaIcon,
      key: "lazada",
      action: handleConnectLazada
    },
    {
      title: "Kết nối Sendo",
      icon: sendoIcon,
      key: "sendo",
      action: handleConnectSendo
    }
  ], [handleConnectLazada, handleConnectSendo, handleConnectShopee, handleConnectTiki]);

  const ecommerceList = (
    <Menu>
      {ECOMMERCE_LIST?.map((ecommerce: any) => (
        <Menu.Item key={ecommerce.key} onClick={ecommerce.action}>
          <img
            src={ecommerce.icon}
            alt={ecommerce.key}
            style={{ marginRight: "10px" }}
          />
          <span>{ecommerce.title}</span>
        </Menu.Item>
      ))}
    </Menu>
  );
  //Kết thúc


  return (
    <StyledComponent>
      <ContentContainer
        title="SÀN THƯƠNG MẠI ĐIỆN TỬ"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Sàn TMĐT",
            path: `${UrlConfig.ECOMMERCE}`,
          },
          {
            name: "Cấu hình",
          },
        ]}
        extra={
          <>
            {activeTab === "sync" && allowShopsConnect &&
              <Dropdown
                overlay={ecommerceList}
                trigger={["click"]}
                disabled={isLoading}
                className="connect-ecommerce-dropdown"
              >
                <Button size="large">
                  <span>Thêm kết nối mới</span>
                  <DownOutlined />
                </Button>
              </Dropdown>
            }
          </>
        }
      >
        <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <>
              <Card>
                <Tabs
                  activeKey={activeTab}
                  onChange={(active) => {
                    history.replace(`${history.location.pathname}#${active}`);
                    reloadConfigData();
                    setConfigFromEcommerce(undefined)
                  }}
                >
                  <TabPane tab="Đồng bộ sàn" key="sync">
                    <SyncEcommerce
                      configData={configData}
                      setConfigToView={setConfigToView}
                      reloadConfigData={reloadConfigData}
                      showDeleteModal={handleShowDeleteModal}
                    />
                  </TabPane>
                  <TabPane tab="Cài đặt cấu hình" key="setting">
                    <SettingConfig
                      listStores={stores}
                      accounts={accounts}
                      accountChangeSearch={accountChangeSearch}
                      form={configForm}
                      configData={configData}
                      configToView={configToView}
                      reloadConfigData={reloadConfigData}
                      setConfigToView={setConfigToView}
                      configFromEcommerce={configFromEcommerce}
                      setConfigFromEcommerce={setConfigFromEcommerce}
                      showDeleteModal={handleShowDeleteModal}
                      storeChangeSearch={storeChangeSearch}
                    />
                  </TabPane>
                </Tabs>
              </Card>
      
              <EcommerceModal
                onCancel={() => setIsShowDeleteModal(false)}
                onOk={onOkDeleteEcommerce}
                visible={isShowDeleteModal}
                okText="Đồng ý"
                cancelText="Hủy"
                title=""
                text={`Bạn có chắc chắn xóa gian hàng ${modalShopInfo?.name} này không?`}
                icon={DeleteIcon}
              />

              {isConfirmUpdateShop &&
                <Modal
                  visible={isConfirmUpdateShop}
                  onCancel={() => {
                    setConfigFromEcommerce(undefined);
                    setIsConfirmUpdateShop(false);
                  }}
                  okText="Đồng ý"
                  onOk={() => {
                    setIsConfirmUpdateShop(false);
                    history.replace(`${history.location.pathname}#setting`);
                  }}
                >
                  <StyledConfirmUpdateShopModal>
                    <div className="confirm-update-shop">
                      <div className="image"><img src={connectedShopIcon} alt="connectedShopIcon" /></div>
                      <div>
                        <div className="title">Gian hàng đã tồn tại trên hệ thống</div>
                        <div>Bạn có muốn chỉnh sửa cấu hình gian hàng không?</div>
                      </div>
                    </div>
                  </StyledConfirmUpdateShopModal>
                </Modal>
              }
              
            </>
            : <NoPermission />)}
        </AuthWrapper>
      </ContentContainer>
    </StyledComponent>
  );
};

export default EcommerceConfig;
