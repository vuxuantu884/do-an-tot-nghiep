import { Button, Card, Row, Space, Tabs } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";

import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { InventoryDefectsPermission } from "config/permissions/inventory-defects.permission";
import ListInventoryDefect from "./components/ListInventoryDefect";
import UrlConfig from "config/url.config";
import { ListInventoryDefectHistory } from "../ListInventoryDefectHistory";
import { DownloadOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const InventoryDefects: React.FC = () => {
  const history = useHistory();
  const path = history.location.pathname;

  const [activeTab, setActiveTab] = useState<string>(UrlConfig.INVENTORY_DEFECTS);
  const [isExportDefects, setIsExportDefects] = useState(false);

  useEffect(() => {
    if (Object.values(UrlConfig).includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab(UrlConfig.INVENTORY_DEFECTS);
    }
    setIsExportDefects(false);
  }, [path]);

  const handleSetExportDefects = () => {
    if (UrlConfig.INVENTORY_DEFECTS === path) {
      setIsExportDefects(true);
    }
  };

  return (
    <ContentContainer
      title="Hàng lỗi"
      breadcrumb={[
        {
          name: "Kho hàng",
          // path: UrlConfig.HOME,
        },
        {
          name: "Hàng lỗi",
          path: UrlConfig.INVENTORY_DEFECTS,
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              className="light"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleSetExportDefects}
            >
              Xuất file
            </Button>
            <AuthWrapper acceptPermissions={[InventoryDefectsPermission.create]}>
              <ButtonCreate child="Thêm hàng lỗi" path={`${UrlConfig.INVENTORY_DEFECTS}/create`} />
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <Card className="card-tab">
        <Tabs style={{ overflow: "initial" }} activeKey={activeTab}>
          <TabPane
            tab={<Link to={UrlConfig.INVENTORY_DEFECTS}>Danh sách hàng lỗi</Link>}
            key={UrlConfig.INVENTORY_DEFECTS}
          >
            <ListInventoryDefect
              isExportDefects={isExportDefects}
              setIsExportDefects={setIsExportDefects}
            />
          </TabPane>
          <TabPane
            tab={<Link to={UrlConfig.INVENTORY_DEFECTS_HISTORY}>Lịch sử hàng lỗi</Link>}
            key={UrlConfig.INVENTORY_DEFECTS_HISTORY}
          >
            <ListInventoryDefectHistory />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default InventoryDefects;
