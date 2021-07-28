import { Checkbox, Form, Input, Modal } from "antd";
import { OrderSourceModel } from "model/response/order/order-source.response";

type ModalAddOrderSourceType = {
  visible?: boolean;
  onCreate: (value: OrderSourceModel) => void;
  onCancel: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
};

const ModalAddOrderSource: React.FC<ModalAddOrderSourceType> = (
  props: ModalAddOrderSourceType
) => {
  const { visible, onCreate, onCancel } = props;
  const [form] = Form.useForm();
  const initialFormValue: OrderSourceModel = {
    company: "",
    is_active: false,
    is_default: false,
  };
  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title="Thêm nguồn đơn hàng"
      onOk={() => {
        form
          .validateFields()
          .then((values: OrderSourceModel) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Form.Item
          name="company"
          label="Tên nguồn đơn hàng"
          rules={[
            { required: true, message: "Vui lòng điền tên nguồn đơn hàng !" },
            { max: 10, message: "Tên nguồn đơn hàng tối đa 10 kí tự" },
          ]}
        >
          <Input
            placeholder="Nhập tên nguồn đơn hàng"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="is_active" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox>Áp dụng cho đơn hàng</Checkbox>
        </Form.Item>
        <Form.Item name="is_default" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddOrderSource;
