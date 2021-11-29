import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Tabs, Form, Button } from "antd";
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
import { showSuccess } from "utils/ToastUtils";
import { ecommerceConfigDeleteAction } from "domain/actions/ecommerce/ecommerce.actions"

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import useAuthorization from "hook/useAuthorization";

import SyncEcommerce from "screens/ecommerce/config/tab/sync-ecommerce"
import SettingConfig from "screens/ecommerce/config/tab/setting-config";

import { PlusOutlined } from "@ant-design/icons";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { StyledComponent } from "screens/ecommerce/config/styles";

const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};

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
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [configData, setConfigData] = React.useState<Array<EcommerceResponse>>(
    []
  );
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false)
  const [configToView, setConfigToView] = React.useState<EcommerceResponse | undefined>();
  const [initQueryConnect] = React.useState<EcommerceSearchQuery>({
    shop_id: connectQuery.get("shop_id"),
    code: connectQuery.get("code"),
  });
  const [configFromEcommerce, setConfigFromEcommerce] = React.useState<EcommerceResponse  | undefined>() 
  const [modalShopInfo, setModalShopInfo] = React.useState<EcommerceResponse>()

  const reloadConfigData = React.useCallback(() => {
    dispatch(ecommerceConfigGetAction(setConfigData))
  }, [dispatch])

  const handleShowDeleteModal = (item: any) => {
    setModalShopInfo(item)
    setIsShowDeleteModal(true)
  }
  const deleteCallback = React.useCallback((value: any) => {
    if(value) {
      showSuccess("Xóa gian hàng thành công")
      reloadConfigData()
      setConfigToView(undefined);
      history.replace(`${history.location.pathname}#sync`);
    }
  },[reloadConfigData, history])

  const onOkDeleteEcommerce = React.useCallback(() => {
    setIsShowDeleteModal(false)
    if(modalShopInfo) dispatch(ecommerceConfigDeleteAction(modalShopInfo?.id, deleteCallback))
  },[deleteCallback, dispatch, modalShopInfo])


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

  const handleConnectEcommerce = React.useCallback(() => {
    dispatch(ecommerceConnectAction(redirectCallback));
  }, [dispatch, redirectCallback]);

  const configInfoCallback = React.useCallback(
    (value: any) => {
      if (value) {
        setConfigFromEcommerce(value);
        history.replace(`${history.location.pathname}#setting`);
      }
    },
    [history]
  );

  React.useEffect(() => {
    if (initQueryConnect.shop_id && initQueryConnect.code) {
      dispatch(ecommerceConfigInfoAction(initQueryConnect, configInfoCallback));
    }
  }, [initQueryConnect, configInfoCallback, dispatch]);
  
  // get all ecommerce
  React.useEffect(() => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }, [dispatch]);
  
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


  return (
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
          {activeTab === "sync" && allowShopsConnect && (
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleConnectEcommerce}
            >
              Thêm kết nối mới
            </Button>
          )}
        </>
      }
    >
      <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <StyledComponent>
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
          </StyledComponent>
          : <NoPermission />)}
      </AuthWrapper>
    </ContentContainer>
  );
};

export default EcommerceConfig;
