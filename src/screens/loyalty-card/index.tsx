import { Card, Tabs } from 'antd';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
import { CustomerCardPermissions } from 'config/permissions/customer.permission';
import UrlConfig from 'config/url.config';
import useAuthorization from 'hook/useAuthorization';
import { useState } from 'react';
import LoyaltyCards from './list';
import LoyaltyCardRelease from './release';


const { TabPane } = Tabs;

const createCardReleasePermission = [CustomerCardPermissions.CREATE_RELEASE];

const LoyaltyCardPage = () => {
  const [allowCreateCardRelease] = useAuthorization({
    acceptPermissions: createCardReleasePermission,
    not: false,
  });

  const [activeTab, setActiveTab] = useState<string>('1')
  return (
    <ContentContainer
      title="Thẻ khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thẻ khách hàng"
        }
      ]}
      extra={
        <>
          {
            activeTab === '1' && allowCreateCardRelease && (
              <ButtonCreate
                path={`${UrlConfig.CUSTOMER}/cards/upload`}
                child="Thêm mới"
              />
            )
          }
        </>
      }
    >
      <Card>
        <Tabs defaultActiveKey="1" onChange={(activeKey: string) => setActiveTab(activeKey)}>
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