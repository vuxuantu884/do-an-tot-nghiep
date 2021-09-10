import { Button, Card, Row, Space, Tabs } from "antd";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import TabProduct from "./tab/tab-product";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import TabHistoryPrice from "./tab/tab-history-price";
import TabHistoryInfo from "./tab/tab-history-info";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
const { TabPane } = Tabs;

const ListProductScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
  useEffect(() => {
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
      }
    }
  }, [history.location.hash]);
  return (
    <ContentContainer
      title="Quản lý sản phẩm"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
        },
      ]}
      extra={
        <Row>
          <Space>
            <Link to={`${UrlConfig.PRODUCT}/import`}>
              <Button
                type="default"
                className="light"
                size="large"
                icon={
                  <img src={importIcon} style={{ marginRight: 8 }} alt="" />
                }
              >
                Nhập file
              </Button>
            </Link>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              // onClick={onExport}
              onClick={() => {}}
            >
              Xuất file
            </Button>
            <ButtonCreate path={`${UrlConfig.PRODUCT}/create`} />
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
          <TabPane tab="Danh sách sản phẩm" key="1">
            <TabProduct />
          </TabPane>
          <TabPane tab="Lịch sử sản phẩm" key="2">
            <TabHistoryInfo />
          </TabPane>
          <TabPane tab="Lịch sử giá" key="3">
            <TabHistoryPrice />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default ListProductScreen;
