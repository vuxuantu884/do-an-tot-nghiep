import { Button, Card, Row, Space, Tabs } from "antd";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import TabProduct from "../tab/TabProduct";
import TabProductWrapper from "../tab/TabProductWrapper";
import TabHistoryInfo from "../tab/TabHistoryInfo";
import TabHistoryPrice from "../tab/TabHistoryPrice";
import { StickyContainer, Sticky } from "react-sticky";
const { TabPane } = Tabs;

const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
  <Sticky>
    {({ style }) => (
      <DefaultTabBar
        {...props}
        style={{ zIndex: 1000, backgroundColor: "white", ...style }}
      />
    )}
  </Sticky>
);

const ListProductScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
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
    <StickyContainer>
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
                icon={
                  <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
                }
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
            renderTabBar={renderTabBar}
          >
            <TabPane tab="Danh sách sản phẩm" key="1">
              <TabProduct />
            </TabPane>
            <TabPane tab="Danh sách cha" key="2">
              <TabProductWrapper />
            </TabPane>
            <TabPane tab="Lịch sử sản phẩm" key="3">
              <TabHistoryInfo />
            </TabPane>
            <TabPane tab="Lịch sử giá" key="4">
              <TabHistoryPrice />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </StickyContainer>
  );
};

export default ListProductScreen;
