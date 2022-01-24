import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import TabCurrent from "./tabs/TabCurrent";
import TabList from "./tabs/TabList/index";
import TabLogs from "./tabs/TabLogs";

const {TabPane} = Tabs;
const ProcurementScreen: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  const path = history.location.pathname;
  console.log(path, history);

  const [activeTab, setActiveTab] = useState<string>(ProcurementTabUrl.ALL);

  useEffect(() => {
    if (Object.values(ProcurementTabUrl).includes(path)) {
      setActiveTab(path);
    } else {
      history.push(ProcurementTabUrl.TODAY);
      setActiveTab(ProcurementTabUrl.TODAY);
    }
  }, [history, path]);

  return (
    <ContentContainer
      title="Danh sách phiếu nhập kho"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Phiếu nhập kho",
        },
      ]}
    >
      <Card className="card-tab">
        <Tabs
          style={{overflow: "initial"}}
          activeKey={activeTab}
          onChange={(active) => {
            setActiveTab(active);
            history.push(active);
          }}
          renderTabBar={RenderTabBar}
        >
          <TabPane tab="Hàng về hôm nay" key={ProcurementTabUrl.TODAY}>
            <TabCurrent />
          </TabPane>
          <TabPane tab="Danh sách phiếu nhập kho" key={ProcurementTabUrl.ALL}>
            <TabList />
          </TabPane>
          <TabPane tab="Lịch sử phiếu nhập kho" key={ProcurementTabUrl.LOGS}>
            <TabLogs />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default ProcurementScreen;
