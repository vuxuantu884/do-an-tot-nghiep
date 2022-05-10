import { Button, Card, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
// import TabCurrent from "./tabs/TabCurrent";
// import TabSevenDays from "./tabs/TabSevenDays";
import TabList from "./tabs/TabList/index";
import TabLogs from "./tabs/TabLogs";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { GoPlus } from "react-icons/go";

const {TabPane} = Tabs;
const ProcurementScreen: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  const path = history.location.pathname;

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
      extra={
        <Row>
          <Space>
            <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_create]}>
              <Button
                type="primary"
                className="ant-btn-primary"
                size={"large"}
                icon={<GoPlus style={{ marginRight: "0.2em" }} />}
                onClick={() => history.push(`${UrlConfig.PROCUREMENT}/create`)}
              >
                Nhập kho bằng tải file
              </Button>
            </AuthWrapper>
            <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_create]}>
              <Button
                type="primary"
                className="ant-btn-primary"
                size={"large"}
                icon={<GoPlus style={{ marginRight: "0.2em" }} />}
                onClick={() => history.push(`${UrlConfig.PROCUREMENT}/create-manual`)}
              >
                Nhập kho thủ công
              </Button>
            </AuthWrapper>
          </Space>
        </Row>
      }
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
          {/* Do cải tiến PO và Procurement nên tạm thời k sử dụng 2 tabs này */}
          {/* <TabPane tab="Hàng về hôm nay" key={ProcurementTabUrl.TODAY}>
            <TabCurrent />
          </TabPane>
          <TabPane tab="Hàng về 7 ngày" key={ProcurementTabUrl.SEVEN_DAYS}>
            <TabSevenDays />
          </TabPane> */}
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
