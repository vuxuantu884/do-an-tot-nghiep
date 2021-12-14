import {Col, Form, Input, Modal, Row} from "antd";
import {SupplierPayment, SupplierPaymentResposne} from "model/core/supplier.model";
import {useCallback, useEffect} from "react";

type SupplierPaymentModalProps = {
  visible: boolean;
  onCancle: () => void;
  data: SupplierPaymentResposne | null;
  onSave: (addressId: number | undefined | null, request: SupplierPayment) => void;
  confirmLoading: boolean;
};

const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = (
  props: SupplierPaymentModalProps
) => {
  const {visible, onCancle, data, onSave, confirmLoading} = props;
  const [form] = Form.useForm();
  const onFinish = useCallback(
    (value: SupplierPayment) => {
      onSave(value.id, value);
    },
    [onSave]
  );
  useEffect(() => {
    if (visible && form) {
      form.resetFields();
    }
  }, [form, visible]);
  return (
    <Modal
      maskClosable={false}
      onCancel={onCancle}
      confirmLoading={confirmLoading}
      closable={false}
      title={data === null ? "Thêm thông tin thanh toán" : "Sửa thông tin"}
      visible={visible}
      okText={"Lưu lại"}
      onOk={() => {
        form.submit();
      }}
      
    >
      <Form
        onFinish={onFinish}
        form={form}
        layout="vertical"
        initialValues={
          data === null
            ? {
                name: "",
                brand: "",
                number: "",
                beneficiary: "",
              }
            : data
        }
      >
        <Row gutter={50}>
          <Form.Item name="supplier_id" hidden noStyle>
            <Input />
          </Form.Item>
          <Form.Item name="id" hidden noStyle>
            <Input />
          </Form.Item>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tên ngân hàng không được để trống",
                },
              ]}
              label="Tên ngân hàng"
              name="name"
            >
              <Input placeholder="Nhập tên ngân hàng" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Chi nhánh không được để trống",
                },
              ]}
              label="Chi nhánh"
              name="brand"
            >
              <Input placeholder="Nhập chi nhánh" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={50}>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Số tài khoản không được để trống",
                },
              ]}
              label="Số tài khoản"
              name="number"
            >
              <Input placeholder="Nhập số tài khoản" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Người thụ hưởng không được để trống",
                },
              ]}
              label="Người thụ hưởng"
              name="beneficiary"
            >
              <Input placeholder="Nhập người thụ hưởng" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SupplierPaymentModal;
