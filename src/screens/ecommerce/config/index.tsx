import React from "react";
import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import SyncEcommerce from "./tab/sync-ecommerce";
import SettingConfig from "./tab/setting-config";
import ButtonCreate from "component/header/ButtonCreate";

const { TabPane } = Tabs;

const EcommerceConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
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

  return (
    <ContentContainer
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
      extra={
        <>{activeTab === "1" && <ButtonCreate path={`/customers/create`} />}</>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(active) =>
            history.replace(`${history.location.pathname}#${active}`)
          }
        >
          <TabPane tab="Đồng bộ sàn" key="1">
            <SyncEcommerce />
          </TabPane>
          <TabPane tab="Cài đặt cấu hình" key="2">
            <SettingConfig />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default EcommerceConfig;
