import React from "react";
import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import SyncEcommerce from "./tab/sync-ecommerce";
import SettingConfig from "./tab/setting-config";
import ButtonCreate from "component/header/ButtonCreate";
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

const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};

const EcommerceConfig: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<string>("sync");
  const history = useHistory();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);

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
          {activeTab === "sync" && <ButtonCreate path={`/customers/create`} />}
        </>
      }
    >
      <StyledComponent>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(active) =>
              history.replace(`${history.location.pathname}#${active}`)
            }
          >
            <TabPane tab="Đồng bộ sàn" key="sync">
              <SyncEcommerce />
            </TabPane>
            <TabPane tab="Cài đặt cấu hình" key="setting">
              <SettingConfig
                listStores={stores}
                accounts={accounts}
                accountChangeSearch={accountChangeSearch}
              />
            </TabPane>
          </Tabs>
        </Card>
      </StyledComponent>
    </ContentContainer>
  );
};

export default EcommerceConfig;
