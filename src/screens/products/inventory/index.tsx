import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import StickyUnderNavbar from "component/container/StickyUnderNavbar";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import AllTab from "./tab/all.tab";
import DetailTab from "./tab/detail.tab";
import HistoryTab from "./tab/history.tab";

const { TabPane } = Tabs;

const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
  <StickyUnderNavbar>
    <DefaultTabBar
        {...props}
      />
  </StickyUnderNavbar>
);
const InventoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  useEffect(() => {
    if (history.location.hash) {
      let hash = history.location.hash.split('?');
      switch (hash[0]) {
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
  return (
    <ContentContainer
      isLoading={loading}
      title="Danh sách tồn kho"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Danh sách tồn kho",
        },
      ]}
    >
      <Card style={{ padding: 0 }} className="card-tab">
        <Tabs
          style={{ overflow: "initial" }}
          activeKey={activeTab}
          onChange={(active) => history.replace(`${history.location.pathname}#${active}`)}
          renderTabBar={renderTabBar}
        >
          <TabPane tab="Toàn hệ thống" key="1">
            <AllTab stores={stores} current={activeTab} />
          </TabPane>
          <TabPane tab="Chi tiết" key="2">
            <DetailTab stores={stores} current={activeTab} />
          </TabPane>
          <TabPane tab="Lịch sử tồn kho" key="3">
            <HistoryTab stores={stores} current={activeTab} />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default InventoryScreen;
