import React from 'react'
import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import SyncEcommerce from './tab/sync.ecommerce';

const { TabPane } = Tabs;

const EcommerceConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  useEffect(() => {
    if (history.location.hash) {
      switch (history.location.hash) {
        case "#1":
          setActiveTab("1");
          break;
        case "#2":
          setActiveTab("2");
          break;
        case "#3":
          setActiveTab("3");
          break;
      }
    }
  }, [history.location.hash]);
  useEffect(() => {
  
      dispatch(getListStoresSimpleAction((stores) => {
        setLoading(false);
        setStores(stores);
      }));
  }, [dispatch]);

  //mock
  
  
  
  return (
    <ContentContainer
      isLoading={loading}
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
    >
      <Card>
        <Tabs activeKey={activeTab} onChange={(active) => history.replace(`${history.location.pathname}#${active}`)}>
          <TabPane tab="Đồng bộ sàn" key="1">
          <SyncEcommerce />
          </TabPane>
          <TabPane tab="Cài đặt cấu hình" key="2">
            {/* <DetailTab  stores={stores} current={activeTab} /> */}
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default EcommerceConfig;
