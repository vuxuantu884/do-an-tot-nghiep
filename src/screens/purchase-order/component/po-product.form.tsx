import { Card, Checkbox, Form, Space } from "antd";

const POProductForm: React.FC = () => {
  return (
    <Form>
      <Card
        className="po-form margin-top-20"
        title={
          <Space>
            <i className="icon-dot icon-title" />
            Sản phẩm
          </Space>
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
