import { Card, Checkbox, Form, Space } from "antd";

const POProductForm: React.FC = () => {
  return (
    <Form>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN SẢN PHẨM</span>
          </div>
        }
        extra={
          <Space size={20}>
            <Checkbox>Tách dòng</Checkbox>
          </Space>
        }
      >
        <div className="padding-20">
          
        </div>
      </Card>
    </Form>
  );
};

export default POProductForm;
