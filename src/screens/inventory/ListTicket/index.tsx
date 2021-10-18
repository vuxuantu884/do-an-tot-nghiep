import { Button, Card, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import HistoryInventoryTransferTab from "./ListTicketTab/HistoryInventoryTransfer";
import InventoryTransferTab from "./ListTicketTab/InventoryTransfer";
import { ListTicketStylesWrapper } from "./Styles";
const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();

  useEffect(() => {
    if (history.location.hash) {
      let hash = history.location.hash.split("?");
      switch (hash[0]) {
        case "#2":
          setActiveTab("2");
          break;
        default:
          setActiveTab("1");
      }
    }
  }, [history.location.hash, history.location.search]);

  return (
    <ListTicketStylesWrapper>
      <ContentContainer
        title="Chuyển hàng"
        breadcrumb={[
          {
            name: "Tổng quản",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
          },
        ]}
        extra={
          parseInt(activeTab) === 1 &&
          <Row>
            <Space>
              <Button
                type="default"
                className="light"
                size="large"
                onClick={() => {}}
              >
                Xin hàng
              </Button>
              <ButtonCreate path={`${UrlConfig.INVENTORY_TRANSFER}/create`} />
            </Space>
          </Row>
        }
      >
        <Card>
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            onChange={(active) =>
              history.replace(`${history.location.pathname}#${active}`)
            }
          >
            <TabPane tab="Danh sách phiếu" key="1">
              <InventoryTransferTab />
            </TabPane>
            <TabPane tab="Lịch sử phiếu" key="2">
              <HistoryInventoryTransferTab />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </ListTicketStylesWrapper>
  );
};
export default InventoryListScreen;
