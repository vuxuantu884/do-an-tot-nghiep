//#region Import
import { Row, Col, Space, Divider } from "antd";

import {
  EnvironmentOutlined,
  PhoneOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";

const SupplierInfo = () => {
  return (
    <div className="padding-20">
      <Space size={40}>
        <Space>
          <Link to="#">Đỗ Nguyệt Anh</Link>
        </Space>
      </Space>
      <Divider className="margin-0" />
      <div className="padding-20">
        <Row gutter={10}>
          <Col md={12}>
            <Space direction="vertical">
              <strong>Địa chỉ giao hàng</strong>
              <span>
                <ProfileOutlined /> Kho online
              </span>
              <span>
                <PhoneOutlined /> 0986868686
              </span>
              <span>
                <EnvironmentOutlined />
                YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
              </span>
            </Space>
          </Col>
          <Col md={12}>
          <Space direction="vertical">
              <strong>Địa chỉ hóa đơn</strong>
              <span>
                <ProfileOutlined /> Kho online
              </span>
              <span>
                <PhoneOutlined /> 0986868686
              </span>
              <span>
                <EnvironmentOutlined />
                YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
              </span>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SupplierInfo;
