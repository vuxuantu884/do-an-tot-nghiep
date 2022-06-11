import { Card, Col, Row } from 'antd';
import React from 'react';
import ProductSaleGroup from './product-business-result';
import ProductListTabs from './product-list-table';
import TotalSalesByStoreTabs from './total-sales-by-store-table';


function ProductDashboard() {
    
    return (
        <Card className="product-dashboard">
            <Row gutter={20}>
                <Col xs={24} md={8}>
                    <Card title="Doanh thu theo nhóm sản phẩm" className="product-group-cart">
                        <ProductSaleGroup  />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Doanh thu theo sản phẩm" className="product-group-cart">
                        <ProductListTabs  />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Doanh thu theo cửa hàng" className="product-group-cart">
                        <TotalSalesByStoreTabs  />
                    </Card>
                </Col>
                {/* <Col span={14}>
            <GoodAreComingTable {...goodAreComing} />
            <Divider className="divider-table" />
            <OrderStatusTable data={orderStatus} />
          </Col> */}
            </Row>
        </Card>
    )
}

export default ProductDashboard