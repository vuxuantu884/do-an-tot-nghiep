//#region Import
import { Card, Input, Select, Form, Space } from "antd";
import { useEffect } from "react";
import { InfoCircleOutlined, ProfileOutlined } from "@ant-design/icons";;

const PurchaseInfo = () => {

  useEffect(() => {}, []);

  return (
    <div>
      <Card
        title={
          <Space>
            <InfoCircleOutlined />
            Thông tin đơn hàng
          </Space>
        }
      >
        <div className="padding-20">
          <Form.Item label="Nhân viên bán hàng" required>
            <Select showArrow placeholder="Chọn nhân viên bán hàng"></Select>
          </Form.Item>
          <Form.Item
            label="Tham chiếu"
            tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
          >
            <Input placeholder="Điền tham chiếu" />
          </Form.Item>
          <Form.Item
            label="Đường dẫn"
            tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
          >
            <Input placeholder="Điền đường dẫn" />
          </Form.Item>
        </div>
      </Card>
      <Card
        className="margin-top-20"
        title={
          <Space>
            <ProfileOutlined />
            Thông tin bổ sung
          </Space>
        }
      >
        <div className="padding-20">
          <Form.Item
            label="Ghi chú"
            tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
          >
            <Input.TextArea placeholder="Điền Ghi chú" />
          </Form.Item>
          <Form.Item
            label="Tag"
            tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
          >
            <Input placeholder="Thêm tag" />
          </Form.Item>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseInfo;
