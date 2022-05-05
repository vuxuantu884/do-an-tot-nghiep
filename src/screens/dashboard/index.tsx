/**
 * Read carefully, this is the dashboard screen.
 * Data trong dashboard được quản lý tập trung tại context của dashboard
 * Việc request api được xử lý trong các hook: dashboard/hooks 
 * Lý do dùng cách này để quản lý lượng request api sao cho phù hợp bởi đặc thù của dashboard là sử dụng lại các câu query của báo cáo 
 * Đối với mỗi component thì có thể sử dụng 1 hoặc nhiều câu query để lấy dữ liệu, tuy nhiên cần tính toán xem có gom các câu query lại thành 1 câu query không
 * VD : Doanh thu online, offline, trả hàng được gom lại thành 1 câu query để giảm thời gian load dữ liệu
 * Ngoài ra cách tổ chức này sẽ support nhu cầu thay vị trí các component trong tương lai
 * Đọc code xong đừng chửi, peace!
 */
import { Card, Col, Row } from "antd";
import { TOP_CHARTS_KEY } from "config/dashboard";
import { useContext } from "react";
import BusinessResult from "./business-result";
import RankHorizontalChart from "./chart/rank-hirizontal-chart";
import RankVerticalChart from "./chart/rank-vertical-chart";
import DashboardFilter from "./filter/index";
import Greeting from "./greeting";
import useFetchTopSaleByDepartment from "./hooks/useFetchTopSaleByDepartment";
import useFetchTopSaleByShop from "./hooks/useFetchTopSaleByShop";
import useFetchTopSaleByStaff from "./hooks/useFetchTopSaleByStaff";
import { DashboardContainer } from "./index.style";
import ProductDashboard from "./product";
import DashboardPrivider, { DashboardContext } from "./provider/dashboard-provider";
const Dashboard = () => {
  const { topSale } = useContext(DashboardContext);

  useFetchTopSaleByStaff();
  useFetchTopSaleByShop();
  useFetchTopSaleByDepartment();

  return (
    <DashboardContainer>
      <Greeting />
      <DashboardFilter />

      <BusinessResult />
      <Card title="BẢNG THI ĐUA">
        <Row className="rank-container">
          <Col xs={24} md={8} className="user-rank">
            <RankVerticalChart data={topSale.get(TOP_CHARTS_KEY.TOP_STAFF_SALES) || []} />
          </Col>
          <Col xs={24} md={8} className="store-rank">
            <RankHorizontalChart data={topSale.get(TOP_CHARTS_KEY.TOP_SHOP_SALES) || []} />
          </Col>
          <Col xs={24} md={8} className="department-rank">
            <RankHorizontalChart data={topSale.get(TOP_CHARTS_KEY.TOP_DEPARTMENT_SALES) || []}
              title="Bảng thi đua giữa các bộ phận"
              subTitle="Top 5 bộ phận có doanh thu cao nhất"
            />
          </Col>
        </Row>
        <div className="padding-20" />
      </Card>

      <ProductDashboard /> {/* DOANH THU THEO NHÓM SẢN PHẨM */}
    </DashboardContainer>
  );
};

const DashboardWithProvider = (props: any) => {
  return (
    <DashboardPrivider >
      <Dashboard {...props} />
    </DashboardPrivider>
  );
}

export default DashboardWithProvider;