import { Card, Col, Row } from "antd";
import { TOP_CHARTS_KEY } from "config/dashboard";
import { useContext } from "react";
import BusinessResult from "./business-result";
import RankHorizontalChart from "./chart/rank-hirizontal-chart";
import RankVerticalChart from "./chart/rank-vertical-chart";
import DashboardFilter from "./filter/index";
import Greeting from "./greeting";
import useFetchTopProduct from "./hooks/useFetchTopProduct";
import useFetchTopSaleByDepartment from "./hooks/useFetchTopSaleByDepartment";
import useFetchTopSaleByShop from "./hooks/useFetchTopSaleByShop";
import useFetchTopSaleByStaff from "./hooks/useFetchTopSaleByStaff";
import { DashboardContainer } from "./index.style";
import ImcomeGroupTab from "./product/product-business-result";
import DashboardPrivider, { DashboardContext } from "./provider/dashboard-provider";
const Dashboard = () => {
  const { topSale, dataSrcTopProduct } = useContext(DashboardContext);

  useFetchTopSaleByStaff();
  useFetchTopSaleByShop();
  useFetchTopSaleByDepartment();
  useFetchTopProduct();
  
  return (
    <DashboardContainer>
      <Greeting />
      <DashboardFilter />

      <BusinessResult />
      <Card title="BẢNG THI ĐUA">
        <Row className="rank-container">
          <Col span={8} className="user-rank">
            <RankVerticalChart data={topSale.get(TOP_CHARTS_KEY.TOP_STAFF_SALES) || []} />
          </Col>
          <Col span={8} className="store-rank">
            <RankHorizontalChart data={topSale.get(TOP_CHARTS_KEY.TOP_SHOP_SALES) || []} />
          </Col>
          <Col span={8} className="department-rank">
            <RankHorizontalChart data={topSale.get(TOP_CHARTS_KEY.TOP_DEPARTMENT_SALES) || []}
              title="Bảng thi đua giữa các bộ phận"
              subTitle="Top 5 bộ phận có doanh thu cao nhất"
            />
          </Col>
        </Row>
        <div className="padding-20" />
      </Card>
      <Card className="cart-bottom-wrapper">
        <Row gutter={20}>
          <Col span={10}>
            <Card title="Doanh thu theo nhóm sản phẩm" className="product-group-cart">
              <ImcomeGroupTab data={dataSrcTopProduct} />
            </Card>
          </Col>
          {/* <Col span={14}>
            <GoodAreComingTable {...goodAreComing} />
            <Divider className="divider-table" />
            <OrderStatusTable data={orderStatus} />
          </Col> */}
        </Row>
      </Card>
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