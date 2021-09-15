import { PlusOutlined } from '@ant-design/icons';
import { Card, Tabs, Button } from 'antd';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import { Link } from 'react-router-dom';
import LoyaltyCards from './list';
import LoyaltyCardRelease from './release';
const { TabPane } = Tabs;

const LoyaltyCardPage = () => {
  return (
    <ContentContainer
      title="Phát hành thẻ"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Phát hành thẻ"
        }
      ]}
      extra={
        <>
          <Link to={`${UrlConfig.CUSTOMER}/cards/upload`}>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
            >
              Đợt phát hành
            </Button>
          </Link>
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