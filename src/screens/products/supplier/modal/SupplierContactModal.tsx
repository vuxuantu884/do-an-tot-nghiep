import {Checkbox, Col, Form, Input, Modal, Row} from "antd";
import {SupplierContact, SupplierContactResposne} from "model/core/supplier.model";
import {useCallback, useEffect} from "react";
import {RegUtil} from "utils/RegUtils";

type SupplierContactModalProps = {
  visible: boolean;
  onCancle: () => void;
  data: SupplierContactResposne | null;
  onSave: (addressId: number | undefined | null, request: SupplierContact) => void;
  confirmLoading: boolean;
};

const SupplierContactModal: React.FC<SupplierContactModalProps> = (
  props: SupplierContactModalProps
) => {
  const {visible, onCancle, data, onSave, confirmLoading} = props;
  const [form] = Form.useForm();
  const onFinish = useCallback(
    (value: SupplierContact) => {
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
      width={760}
      maskClosable={false}
      onCancel={onCancle}
      confirmLoading={confirmLoading}
      closable={false}
      title={data === null ? "Thêm thông tin liên hệ" : "Sửa thông tin liên hệ"}
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
                city_id: null,
                district_id: null,
                address: "",
                is_default: false,
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
          <Col span={12}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tên người liên hệ không được để trống",
                },
              ]}
              name="name"
              label="Tên người liên hệ"
            >
              <Input placeholder="Nhập tên người liên hệ" maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Chức vụ"
            >
              <Input placeholder="Nhập chức vụ" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item
              rules={[
                {
                  pattern: RegUtil.PHONE_HOTLINE,
                  message: "Số điện thoại không đúng định dạng",
                },
              ]}
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại liên hệ" maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fax" label="Fax">
              <Input placeholder="Nhập số fax" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input placeholder="Nhập email" maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Website"
              name="website"
              rules={[
                {
                  pattern: RegUtil.WEBSITE_URL,
                  message: "Website chưa đúng định dạng",
                },
              ]}
            >
              <Input placeholder="Nhập website" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item valuePropName="checked" name="is_default">
              <Checkbox disabled={data && data.id && data.is_default ? true : false}>
                Đặt làm mặc định
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SupplierContactModal;
