import {
  Card,
  Checkbox,
  Form,
  Space,
} from "antd";

const POInventoryForm: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="po-inventory"
    >
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">NHẬP KHO</span>
          </div>
        }
        extra={
          <Space size={20}>
            <Checkbox>
              Tạo phiếu nhập kho nháp
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

export default POInventoryForm;
