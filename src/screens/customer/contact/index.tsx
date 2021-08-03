import { MinusCircleOutlined } from "@ant-design/icons";
import { Row, Col, Form, Input } from "antd";
import PropTypes from "prop-types";
interface ContactFormProps {
  field: any;
  remove: (index: number | number[]) => void;
  index: number;
}

const ContactForm = ({ field, remove, index }: ContactFormProps) => {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <h5>Liên hệ {index}</h5>
      </Col>
      <Col span={23}>
        <Row gutter={8}>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "title"]}
            >
              <Input placeholder="Tiêu đề" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "name"]}
            >
              <Input placeholder="Tên người liên hệ" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "email"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thư điện tử",
                },
              ]}
            >
              <Input placeholder="Thư điện tử" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "phone"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "note"]}
            >
              <Input placeholder="Ghi chú" />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={1}>
        <MinusCircleOutlined onClick={() => remove(field.name)} />
      </Col>
    </Row>
  );
};

ContactForm.propTypes = {
  field: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default ContactForm;
