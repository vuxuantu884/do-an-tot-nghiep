import { Button, Card, Tabs } from 'antd';
import ContentContainer from 'component/container/content.container';
import { LoyaltyPermission } from 'config/permissions/loyalty.permission';
import UrlConfig from 'config/url.config';
import useAuthorization from 'hook/useAuthorization';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoyaltyCards from 'screens/customer/loyalty-card/card-list/CardList';
import LoyaltyCardRelease from 'screens/customer/loyalty-card/release';
import { StyledCustomerCard } from 'screens/customer/loyalty-card/StyledCustomerCard';

import mathPlusIcon from "assets/icon/math-plus.svg";

const { TabPane } = Tabs;

const createCardReleasePermission = [LoyaltyPermission.cards_release];

const LoyaltyCardPage = () => {
  const [allowCreateCardRelease] = useAuthorization({
    acceptPermissions: createCardReleasePermission,
    not: false,
  });

  const [activeTab, setActiveTab] = useState<string>('1');

  return (
    <StyledCustomerCard>
      <ContentContainer
        title="Thẻ khách hàng"
        extra={
          <>
            {allowCreateCardRelease && activeTab === '1' &&
              <Link to={`${UrlConfig.CUSTOMER}/cards/upload`}>
                <Button
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<img src={mathPlusIcon} style={{ marginRight: 8 }} alt="" />}
                >
                  Thêm mới đợt phát hành
                </Button>
              </Link>
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