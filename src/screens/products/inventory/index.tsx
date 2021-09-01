import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import AllTab from "./tab/all.tab";
import DetailTab from "./tab/detail.tab";
import HistoryTab from "./tab/history.tab";

const { TabPane } = Tabs;

const InventoryScreen: React.FC = () => {
  return (
    <ContentContainer
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
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Toàn hệ thống" key="1">
            <AllTab />
          </TabPane>
          <TabPane tab="Chi tiết">
            <DetailTab />
          </TabPane>
          <TabPane tab="Lịch sử tồn kho" key="3">
            <HistoryTab />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default InventoryScreen;
