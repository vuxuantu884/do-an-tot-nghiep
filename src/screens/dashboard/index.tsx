import { Card, Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import CompareMonthlyChartArea from "./chart/compare-monthly-chart-area";
import ProductIncomeChart from "./chart/product-income-chart";
import RankHorizontalChart from "./chart/rank-hirizontal-chart";
import RankVerticalChart from "./chart/rank-vertical-chart";
import { DashboardContainer } from "./index.style";

const Dashboard = () => {
  return (
    <ContentContainer
      title="Tổng quan"
    >
      <DashboardContainer>
        <Card title="KẾT QUẢ KINH DOANH">
          <Row  style={{ margin: '-20px 0'}}>
            <Col span={6}>
              <div style={{ width: '100%', height: 110, borderBottom: '1px solid #E5E5E5' }}></div>
              <div style={{ width: '100%', height: 110, borderBottom: '1px solid #E5E5E5' }}></div>
              <div style={{ width: '100%', height: 110, borderBottom: '1px solid #E5E5E5' }}></div>
              <div style={{ width: '100%', height: 110, borderBottom: '1px solid #E5E5E5' }}></div>
            </Col>
            <Col span={18}>
              <Row style={{ width: '100%', height: 110 }}>
                <Col span={8} style={{ borderLeft: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5'}}></Col>
                <Col span={8} style={{ borderLeft: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5'}}></Col>
                <Col span={8} style={{ borderLeft: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5'}}></Col>
              </Row>
              <div style={{ width: '100%', height: 330, padding: 20, borderLeft: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}>
                <CompareMonthlyChartArea />
              </div>
            </Col>
          </Row>
        </Card>
        <Card title="BẢNG THI ĐUA">
          <Row  style={{ margin: '-20px 0'}}>
            <Col span={8} style={{ padding: '20px 30px 20px 0'}}>
              <RankVerticalChart/>
            </Col>
            <Col span={8}  style={{ padding: '20px 30px', borderRight: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5' }}>
              <RankHorizontalChart />
            </Col>
            <Col span={8} style={{ padding: '20px 0 20px 30px'}}>
              <RankHorizontalChart />
            </Col>
          </Row>
        </Card>
        <Card title="SẢN PHẨM VÀ TÌNH TRẠNG ĐƠN HÀNG">
          
          <Row>
            <Col span={8}>
              <ProductIncomeChart />
            </Col>
            <Col span={16}>
            </Col>
          </Row>
        </Card>
      </DashboardContainer>
    </ContentContainer>
  )
}

export default Dashboard;