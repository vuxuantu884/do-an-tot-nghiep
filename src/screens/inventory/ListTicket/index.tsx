import {Card, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import HistoryInventoryTransferTab from "./ListTicketTab/HistoryInventoryTransfer";
import InventoryTransferTab from "./ListTicketTab/InventoryTransfer";
import { ListTicketStylesWrapper } from "./Styles";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(InventoryTransferTabUrl.LIST);
  const history = useHistory();
  const {path} = useRouteMatch();

  useEffect(() => {
    let redirectUrl = path;
    if (redirectUrl) {
        if (redirectUrl === InventoryTransferTabUrl.LIST) {
          history.replace(redirectUrl);
          setActiveTab(InventoryTransferTabUrl.LIST);
        }
        if (redirectUrl === InventoryTransferTabUrl.HISTORIES) {
          history.replace(redirectUrl);
          setActiveTab(InventoryTransferTabUrl.HISTORIES);
        } 
    }
  }, [history, path]);

  return (
    <ListTicketStylesWrapper>
      <ContentContainer
        title="Chuyển hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
          },
        ]}
        extra={
          activeTab === InventoryTransferTabUrl.LIST &&
          <Row>
            <Space>
              <AuthWrapper 
                acceptPermissions={[InventoryTransferPermission.create]}
              >
                <ButtonCreate path={`${UrlConfig.INVENTORY_TRANSFERS}/create`} />
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        <Card>
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            onChange={(active) =>
              history.replace(active)
            }
          >
            <TabPane tab="Danh sách phiếu" key={InventoryTransferTabUrl.LIST}>
              <InventoryTransferTab />
            </TabPane>
            <TabPane tab="Lịch sử phiếu" key={InventoryTransferTabUrl.HISTORIES}>
              <HistoryInventoryTransferTab />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </ListTicketStylesWrapper>
  );
};
export default InventoryListScreen;
