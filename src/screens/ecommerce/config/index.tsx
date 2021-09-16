import React from "react";
import { Card, Tabs, Form, Button } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import SyncEcommerce from "./tab/sync-ecommerce";
import SettingConfig from "./tab/setting-config";
import { StyledComponent } from "./styles";
import { useDispatch } from "react-redux";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import {
  ecommerceConfigGetAction,
  ecommerceConnectAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import { useQuery } from "utils/useQuery";
import { EcommerceSearchQuery } from "model/request/ecommerce.request";
import { PlusOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};

const initQueryEcommerceConnect: EcommerceSearchQuery = {
  shopee_name: "",
  code: null,
};

const EcommerceConfig: React.FC = () => {
  const dispatch = useDispatch();
  const connectQuery = useQuery();
  const [configForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("sync");
  const history = useHistory();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [configData, setConfigData] = React.useState<Array<EcommerceResponse>>(
    []
  );
  const [configToView, setConfigToView] = React.useState<EcommerceResponse>();
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
  // làm sau
  const redirectCallback = React.useCallback((value: any) => {
    if (value) {}
  }, []);
  React.useEffect(() => {
    dispatch(ecommerceConnectAction(redirectCallback));
  });

  React.useEffect(() => {
    initQueryEcommerceConnect.shopee_name = connectQuery.get("shopee_name");
    initQueryEcommerceConnect.code = connectQuery.get("code");
    // dispatch(ecommerceConfigAction)
  }, [connectQuery]);
  //
  React.useEffect(() => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }, [dispatch]);
  const reloadConfigData = () => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  };
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

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setStores(stores);
      })
    );
  }, [dispatch]);

  useEffect(() => {
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
          name: "Tổng quản",
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
          {activeTab === "sync" && (
             <Link to={`${UrlConfig.CUSTOMER}/create`}>
             <Button
               className="ant-btn-outline ant-btn-primary"
               size="large"
               icon={<PlusOutlined />}
             >
               Thêm kết nối mới
             </Button>
           </Link>
          )}
        </>
      }
    >
      <StyledComponent>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(active) => {
              history.replace(`${history.location.pathname}#${active}`);
              reloadConfigData();
            }}
          >
            <TabPane tab="Đồng bộ sàn" key="sync">
              <SyncEcommerce
                configData={configData}
                setConfigToView={setConfigToView}
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
              />
            </TabPane>
          </Tabs>
        </Card>
      </StyledComponent>
    </ContentContainer>
  );
};

export default EcommerceConfig;
