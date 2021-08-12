import { MinusCircleOutlined } from "@ant-design/icons";
import { Row, Col, Form, Input, Divider } from "antd";
import PropTypes from "prop-types";
interface NoteFormProps {
  field: any;
  remove: (index: number | number[]) => void;
  index: number;
}

const NoteForm = ({ field, remove, index }: NoteFormProps) => {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <Divider orientation="left">Ghi chú {index}</Divider>
      </Col>
      <Col span={23} style={{padding: '0 1rem'}}>
        <Row gutter={8}>
          <Col span={6}>
            <Form.Item
              {...field}
              label="Nội dung"
              name={[field.name, "content"]}
            >
              <Input.TextArea placeholder="Nội dung" />
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

NoteForm.propTypes = {
  field: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default NoteForm;
