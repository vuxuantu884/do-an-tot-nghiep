// import { Card,  Col,  Row } from "antd";
import { DashboardContainer } from "./index.style";
import Greeting from "./shared/greeting";
// import { RootReducerType } from "model/reducers/RootReducerType";
// import CompareMonthlyChartArea from "./chart/compare-monthly-chart-area";
// import RankHorizontalChart from "./chart/rank-hirizontal-chart";
// import RankVerticalChart from "./chart/rank-vertical-chart";
// import DateFilterSelect from "./shared/date-filter-select";
// import DepartmentSelect from "./shared/department-select";
// import IncomeBox from "./shared/income-box";
const Dashboard = () => {
  return (

    <DashboardContainer>
      <Greeting/>
      {/* <Card >
        <div className="dashboard-filter">
          <h1 className="title">BỘ LỌC</h1>
          <DateFilterSelect className="select-filter" />
          <DepartmentSelect className="select-filter" />
          <Checkbox >
            Xem dữ liệu của tôi
          </Checkbox>
        </div>
      </Card>
      <Card title="KẾT QUẢ KINH DOANH" className="business-results">
        <Row className="verti-grid">
          <Col span={6}>
            <div className="verti-grid__item"><IncomeBox /></div>
            <div className="verti-grid__item"><IncomeBox /></div>
            <div className="verti-grid__item"><IncomeBox /></div>
            <div className="verti-grid__item"><IncomeBox /></div>
          </Col>
          <Col span={18}>
            <Row className="horiz-grid">
              <Col span={8} className="horiz-grid__item"><IncomeBox /></Col>
              <Col span={8} className="horiz-grid__item"><IncomeBox /></Col>
              <Col span={8} className="horiz-grid__item">
                <IncomeBox />
              </Col>
            </Row>
            <div className="chart-monthly-container">
              <CompareMonthlyChartArea />
            </div>
          </Col>
        </Row>
         
      </Card>
      <Card title="BẢNG THI ĐUA">
        <Row style={{ margin: '-20px 0' }}>
          <Col span={8} style={{ padding: '20px 30px 20px 0' }}>
            <RankVerticalChart />
          </Col>
          <Col span={8} style={{ padding: '20px 30px', borderRight: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5' }}>
            <RankHorizontalChart />
          </Col>
          <Col span={8} style={{ padding: '20px 0 20px 30px' }}>
            <RankHorizontalChart />
          </Col>
        </Row>
      </Card>
      <Card title="Doanh thu theo nhóm sản phẩm theo tháng">

        <Row>
          <Col span={8}>
          </Col>
          <Col span={16}>
          </Col>
        </Row>
      </Card> */}
    </DashboardContainer>

  )
}

export default Dashboard;