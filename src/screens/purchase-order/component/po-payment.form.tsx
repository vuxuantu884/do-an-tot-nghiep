import {
  Card,
  Checkbox,
  Form,
  Space,
} from "antd";

const POPaymentForm: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="po-payment"
    >
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THANH TOÁN</span>
          </div>
        }
        extra={
          <Space size={20}>
            <Checkbox>
              Thanh toán với nhà cung cấp
            </Checkbox>
          </Space>
        }
      >
        <div>
        </div>
      </Card>
    </Form>
  );
};

export default POPaymentForm;
