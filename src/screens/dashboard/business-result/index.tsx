import { Card, Col, Row } from "antd";
import { BUSINESS_RESULT_CART_NAME } from "config/dashboard";
// import { useContext } from "react";
// import useFetchChartBusinessResult from "../hooks/useFetchTotalSaleChart";
// import { DashboardContext } from "../provider/dashboard-provider";
import useFetchOfflineBRCompleted from "../hooks/useFetchOfflineBRCompleted";
import useFetchOnlineBRCompleted from "../hooks/useFetchOnlineBRCompleted";
import useFetchOnlineBRCreated from "../hooks/useFetchOnlineBRCreated";
import useFetchPreTotalSaleCanceled from "../hooks/useFetchPreTotalSaleCanceled";
import BusinessCard from "./business-card";
type Props = {};

function BusinessResult(props: Props) {
  // const { totalSalesToday, dataSrcChartBusinessResult } = useContext(DashboardContext);
  // const { isFetchingCompanyBRCompleted } = useFetchCompanyBRCompleted();
  const { isFetchingOfflineBRCompleted } = useFetchOfflineBRCompleted();
  const { isFetchingOnlineBRCompleted } = useFetchOnlineBRCompleted();
  const { isFetchingOnlineBRCreated } = useFetchOnlineBRCreated();
  // const { isFetchingChartData } = useFetchChartBusinessResult();
  // const { isFetchingAverageOrder } = useFetchBRAverageOrder();
  // const { isFetchingConversionRate } = useFetchConversionRate();
  // const { isFetchingSuccessRate } = useFetchSuccessRate();
  const { isFetchingPreTotalSaleCanceled } = useFetchPreTotalSaleCanceled();

  return (
    <Card title="KẾT QUẢ KINH DOANH" className="business-results">
      <Row className="verti-grid">
        <Col xs={24} md={8} lg={6}>
          <div className="verti-grid__item">
            <BusinessCard
              dataKey={BUSINESS_RESULT_CART_NAME.companyTotalSales}
              loading={isFetchingOfflineBRCompleted && isFetchingOnlineBRCompleted}
            />
          </div>
          <div className="verti-grid__item">
            <BusinessCard
              dataKey={BUSINESS_RESULT_CART_NAME.companyOrders}
              loading={isFetchingOfflineBRCompleted && isFetchingOnlineBRCompleted}
            />
          </div>
        </Col>
        <Col xs={24} md={16} lg={18}>
          <Row className="horiz-grid">
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.offlineTotalSales}
                loading={isFetchingOfflineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.onlineTotalSales}
                loading={isFetchingOnlineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.onlinePreTotalSales}
                loading={isFetchingOnlineBRCreated}
              />
            </Col>
          </Row>
          <Row className="horiz-grid">
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.offlineOrders}
                loading={isFetchingOfflineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.onlineOrders}
                loading={isFetchingOnlineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.onlinePreOrders}
                loading={isFetchingOnlineBRCreated}
              />
            </Col>
          </Row>
          <Row className="horiz-grid">
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.offlineReturns}
                loading={isFetchingOfflineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.onlineReturns}
                loading={isFetchingOnlineBRCompleted}
              />
            </Col>
            <Col xs={24} lg={8} className="horiz-grid__item">
              <BusinessCard
                dataKey={BUSINESS_RESULT_CART_NAME.cancelledPreTotalSales}
                loading={isFetchingPreTotalSaleCanceled}
              />
            </Col>
          </Row>
          {/* <Row>
            <div className="chart-monthly-container">
              <Skeleton />
              {isFetchingChartData ? (
                <Skeleton active />
              ) : (
                <TotalSaleByMonthChartArea
                  monthTotalSalesOverDay={dataSrcChartBusinessResult}
                  totalSalesToday={totalSalesToday}
                />
              )}
            </div>
          </Row> */}
        </Col>
        <div className="padding-20" />
      </Row>
    </Card>
  );
}

export default BusinessResult;
