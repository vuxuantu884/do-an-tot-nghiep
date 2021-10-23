import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import { StickyUnderNavbar } from "component/container/sticky-under-navbar";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { RouteComponentProps, useParams } from "react-router";
import { useHistory } from "react-router-dom";
import TabCurrent from "./tabs/TabCurrent";
import TabList from "./tabs/TabList/index";
const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
  <StickyUnderNavbar>
    <DefaultTabBar {...props} />
  </StickyUnderNavbar>
);
type PORouteProps = {
  id: string;
};

const TAB = ["1", "2"];

const { TabPane } = Tabs;
const ProcurementScreen: React.FC<RouteComponentProps<PORouteProps>> = (props) => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<string>("1");

  const { id: idTab } = useParams<PORouteProps>();

  useEffect(() => {
    if (TAB.includes(idTab)) {
      setActiveTab(idTab);
    } else {
      setActiveTab("1");
    }
  }, [idTab]);

  return (
    <ContentContainer
      title="Danh sách đơn nhập kho"
      breadcrumb={[
        {
          name: "Tổng quan",
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
          onChange={(active) => history.replace(`${UrlConfig.PROCUREMENT}/${active}`)}
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
  );
};

export default ProcurementScreen;
