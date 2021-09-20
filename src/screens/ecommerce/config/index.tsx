import React from "react";
import { Card, Tabs, Form, Button } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import {useState } from "react";
import { useHistory } from "react-router-dom";
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
import { ecommerceConfigGetAction } from "domain/actions/ecommerce/ecommerce.actions";
import { useQuery } from "utils/useQuery";
import { EcommerceSearchQuery } from "model/request/ecommerce.request";
import { PlusOutlined } from "@ant-design/icons";
import {
  ecommerceConnectAction,
  ecommerceConfigInfoAction,
} from "domain/actions/ecommerce/ecommerce.actions";

const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};

const initQueryConnect: EcommerceSearchQuery = {
  shop_id: "",
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
  // link to ecommerce
  const redirectCallback = React.useCallback((value: any) => {
    if (value) {
      window.open(`${value}`, "_blank");
    }
  }, []);
  const handleConnectEcommerce = React.useCallback(() => {
    dispatch(ecommerceConnectAction(redirectCallback));
  }, [dispatch, redirectCallback]);

  const configInfoCallback = React.useCallback((value: any) => {
      if(value) {
        setConfigToView(value)
        history.replace(`${history.location.pathname}#setting`);
      }
  }, [history])

  React.useEffect(() => {
    initQueryConnect.shop_id = connectQuery.get("shop_id");
    initQueryConnect.code = connectQuery.get("code");
    if (initQueryConnect.shop_id && initQueryConnect.code) {
      dispatch(
        ecommerceConfigInfoAction(initQueryConnect, configInfoCallback)
      );
    }
  }, [dispatch, connectQuery, configInfoCallback]);

  // get all ecommerce
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
