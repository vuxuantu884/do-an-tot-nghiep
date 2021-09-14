import React from "react";
import { Card, Tabs, Form, Button } from "antd";
import vectorIcon from "assets/icon/vector.svg";

import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import TotalItemsEcommerce from "./tab/total-items-ecommerce";
import ConnectedItems from "./tab/connected-items";
import NotConnectedItems from "./tab/not-connected-items";

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
import { TotalItemsEcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import {
  ecommerceConfigGetAction,
} from "domain/actions/ecommerce/ecommerce.actions";

const { TabPane } = Tabs;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};

const Products: React.FC = () => {
  const dispatch = useDispatch();
  const [configForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("total-item");
  const history = useHistory();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [configData, setConfigData] = React.useState<Array<TotalItemsEcommerceResponse>>(
    []
  );
  const [configToView, setConfigToView] = React.useState<TotalItemsEcommerceResponse>();
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
  React.useEffect(() => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }, [dispatch]);
  const reloadConfigData = () => {
    dispatch(ecommerceConfigGetAction(setConfigData));
  }
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
        case "#total-item":
          setActiveTab("total-item");
          break;
        case "#connected-item":
          setActiveTab("connected-item");
          break;
        case "#not-connected-item":
          setActiveTab("not-connected-item");
          break;
      }
    }
  }, [history.location.hash]);


  const getProductsFromEcommerce = () => {
    console.log("Tải sản phẩm từ sàn về nè!");
    
  }

  return (
    <StyledComponent>
      <ContentContainer
        title="DANH SÁCH SẢN PHẨM"
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
            name: "Sản phẩm",
          },
        ]}
        extra={
          <>
            <Button
              onClick={(e) => {
                // e.stopPropagation();
                getProductsFromEcommerce();
              }}
              className="get-products-button"
              size="large"
              icon={<img src={vectorIcon} style={{ marginRight: 8 }} alt="" />}
            >
              Tải sản phẩm từ sàn về
            </Button>
          </>
        }
      >
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={(active) => {
                history.replace(`${history.location.pathname}#${active}`);
                reloadConfigData();
              }}
            >
              <TabPane tab="Tất cả sản phẩm" key="total-item">
                <TotalItemsEcommerce
                  configData={configData}
                  setConfigToView={setConfigToView}
                />
              </TabPane>
              <TabPane tab="Sản phẩm đã ghép" key="connected-item">
                <ConnectedItems
                  listStores={stores}
                  accounts={accounts}
                  accountChangeSearch={accountChangeSearch}
                  form={configForm}
                  configData={configData}
                  configToView={configToView}
                />
              </TabPane>
              <TabPane tab="Sản phẩm chưa ghép" key="not-connected-item">
                <NotConnectedItems
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
      </ContentContainer>
    </StyledComponent>
  );
};

export default Products;
