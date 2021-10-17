import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container"
import StickyUnderNavbar from "component/container/StickyUnderNavbar";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import TabCurrent from "./tabs/TabCurrent";
import TabList from "./tabs/TabList";

const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
  <StickyUnderNavbar>
    <DefaultTabBar
      {...props}
    />
  </StickyUnderNavbar>
);

const { TabPane } = Tabs;
const ProcurementScreen: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<string>("1");
  useEffect(() => {
    console.log(history.location.search);
    if (history.location.hash) {
      let hash = history.location.hash.split("?");
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
        case "#4":
          setActiveTab("4");
          break;
      }
    }
  }, [history.location.hash, history.location.search]);
  return (
    <ContentContainer
      title="Danh sách đơn nhập kho"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đơn nhập kho",
        },
      ]}
    >
      <Card className="card-tab">
        <Tabs
          style={{ overflow: "initial" }}
          activeKey={activeTab}
          onChange={(active) =>
            history.replace(`${history.location.pathname}#${active}`)
          }
          renderTabBar={renderTabBar}
        >
          <TabPane tab="Hàng về hôm nay" key="1">
            <TabCurrent />
          </TabPane>
          <TabPane tab="Danh sách đơn nhập kho" key="2">
            <TabList />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  )
};

export default ProcurementScreen;