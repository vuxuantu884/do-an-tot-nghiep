import React from "react";
import { Button, Card, Row, Space, Tabs, Col } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";

const { TabPane } = Tabs;

const PackSupportScreen:React.FC=()=>{
    return (
        <React.Fragment>
            <ContentContainer
                title="Đóng gói và giao hàng"
                breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: "Đơn hàng",
                    path: UrlConfig.ORDER,
                },
                {
                    name: "Đóng gói và giao hàng",
                }
                ]}
            >
                <Row gutter={24}>
                    <Col xs={24}>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Đóng gói" key="1">
                                <Row  gutter={24}>
                                    <Col xs={24}>
                                    Tab 1
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab="Bàn giao" disabled key="2">
                                Tab 2
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>

            </ContentContainer>
        </React.Fragment>
)};

export default PackSupportScreen;