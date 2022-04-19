import { Card, Col, Row, Skeleton } from 'antd';
import { BUSINESS_RESULT_CART_NAME } from 'config/dashboard';
import React, { useContext } from 'react';
import CompareMonthlyChartArea from '../chart/compare-monthly-chart-area';
import useFetchBRAverageOrder from '../hooks/useFetchAverageOrder';
import useFetchChartBusinessResult from '../hooks/useFetchTotalSaleChart';
import useFetchBusinessResultComplete from '../hooks/useFetchTotalSaleCompleted';
import { DashboardContext } from '../provider/dashboard-provider';
import BusinessCard from "./business-card";
type Props = {}

function BusinessResult(props: Props) {
    const { totalSalesToday, dataSrcChartBusinessResult } = useContext(DashboardContext)
    const { isFetchingBusinessResultComplete } = useFetchBusinessResultComplete();
    const { isFetchingChartData } = useFetchChartBusinessResult();
    const { isFetchingAverageOrder } = useFetchBRAverageOrder();
    return (
        <Card title="KẾT QUẢ KINH DOANH" className="business-results">

            <Row className="verti-grid">
                <Col span={6}>
                    <div className="verti-grid__item">
                        <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.online} loading={isFetchingBusinessResultComplete} />
                    </div>
                    <div className="verti-grid__item">
                        <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.offline} loading={isFetchingBusinessResultComplete} />
                    </div>
                    <div className="verti-grid__item">
                        <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.cancel} />
                    </div>
                    <div className="verti-grid__item">
                        <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.return} loading={isFetchingBusinessResultComplete} />
                    </div>
                </Col>
                <Col span={18}>
                    <Row className="horiz-grid">
                        <Col span={8} className="horiz-grid__item">
                            <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.conversionRate} />
                        </Col>
                        <Col span={8} className="horiz-grid__item">
                            <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.averageOrder} loading={isFetchingAverageOrder} />
                        </Col>
                        <Col span={8} className="horiz-grid__item">
                            <BusinessCard dataKey={BUSINESS_RESULT_CART_NAME.successRate} />
                        </Col>
                    </Row>
                    <div className="chart-monthly-container">

                        {isFetchingChartData ?
                            <Skeleton active/> :
                            <CompareMonthlyChartArea monthTotalSalesOverDay={dataSrcChartBusinessResult} totalSalesToday={totalSalesToday} />
                            }
                    </div>
                </Col>
                <div className="padding-20" />
            </Row>

        </Card>
    )
}

export default BusinessResult