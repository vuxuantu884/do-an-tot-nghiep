import { Card, Tabs } from 'antd';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
import { LoyaltyPermission } from 'config/permissions/loyalty.permission';
import UrlConfig from 'config/url.config';
import useAuthorization from 'hook/useAuthorization';
import { useState } from 'react';
import LoyaltyCards from './list';
import LoyaltyCardRelease from 'screens/customer/loyalty-card/release';
import { StyledCustomerCard } from 'screens/customer/loyalty-card/StyledCustomerCard';


const { TabPane } = Tabs;

const createCardReleasePermission = [LoyaltyPermission.cards_release];

const LoyaltyCardPage = () => {
  const [allowCreateCardRelease] = useAuthorization({
    acceptPermissions: createCardReleasePermission,
    not: false,
  });

  const [activeTab, setActiveTab] = useState<string>('1')
  return (
    <StyledCustomerCard>
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
        <Card className="customer-card">
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
    </StyledCustomerCard>
  )
}

export default LoyaltyCardPage