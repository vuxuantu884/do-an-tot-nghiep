import { Card, Col, Row } from 'antd';
import React from 'react';
import ProductSaleGroup from './product-business-result';


function ProductDashboard() {
    
    return (
        <Card className="product-dashboard">
            <Row gutter={20}>
                <Col span={10}>
                    <Card title="Doanh thu theo nhóm sản phẩm" className="product-group-cart">
                        <ProductSaleGroup  />
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