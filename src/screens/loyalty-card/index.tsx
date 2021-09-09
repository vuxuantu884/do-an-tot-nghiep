import { Card, Tabs } from 'antd';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
import UrlConfig from 'config/url.config';
import React from 'react'
import LoyaltyCards from './list';
import LoyaltyCardRelease from './release';
const { TabPane } = Tabs;

const LoyaltyCardPage = () => {
  return (
    <ContentContainer
      title="Thẻ khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `${UrlConfig.CUSTOMER}`,
        },
        {
          name: "Thẻ khách hàng",
        },
      ]}
      extra={
        <>
          <ButtonCreate path={`${UrlConfig.CUSTOMER}/cards/upload`} child="Đợt phát hành" />
        </>
      }
    >
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Đợt phát hành" key="1">
            <LoyaltyCardRelease />
          </TabPane>
          <TabPane tab="Thẻ phát hành" key="2">
            <LoyaltyCards />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  )
}

export default LoyaltyCardPage