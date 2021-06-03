import {Button, Card, Input, Row, Col} from "antd";
import React from "react";
import peopleIcon from 'assets/img/people.svg';
import productIcon from 'assets/img/cube.svg';
import arrowDownIcon from 'assets/img/drow-down.svg';
import { PlusOutlined } from '@ant-design/icons';

const Bill = () => {

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card className="card-block"
                title={<div className="d-flex"><img src={peopleIcon} alt="" /> Khách hàng</div>}
                extra={
                  <div className="d-flex align-items-center">
                    <label htmlFor="" className="required-label">Nguồn</label>
                    <Input.Search
                      placeholder="Chọn nguồn đơn hàng"
                      enterButton={<Button type="text"><PlusOutlined style={{ color: '#2A2A86' }} /></Button>}
                      suffix={<img src={arrowDownIcon} alt="" />}
                      onSearch={() => console.log(1)}
                    />
                  </div>
                }>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
          <Card className="card-block"
                title={<div className="d-flex"><img src={productIcon} alt="" /> Sản phẩm</div>}
                extra={<a href="#">More</a>}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="Default size card" extra={<a href="#">More</a>}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Bill;