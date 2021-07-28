import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

type ExpenseModalType = {
  visible: boolean;
  onCancel: () => void;
};

const ExpenseModal: React.FC<ExpenseModalType> = (props: ExpenseModalType) => {
  return (
    <Modal
      width={600}
      onCancel={props.onCancel}
      visible={props.visible}
      cancelText="Thoát"
      okText="Áp dụng"
      title="Thêm chi phí"
    >
      <Form
        initialValues={{
          cost_lines: [],
        }}
      >
        <Form.List name="cost_lines">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                <Row key={key} gutter={24}>
                  <Col md={16}>
                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Giá bán không được để trống",
                        },
                      ]}
                      name={[name, "title"]}
                      fieldKey={[fieldKey, "title"]}
                    >
                      <Input placeholder="Tên chi phí" />
                    </Form.Item>
                  </Col>
                  <Col md={6}>
                    <Form.Item
                      name={[name, "amount"]}
                      fieldKey={[fieldKey, "amount"]}
                    >
                      <NumberInput
                        format={(a: string) => formatCurrency(a)}
                        replace={(a: string) => replaceFormatString(a)}
                        placeholder="VD: 100,000"
                      />
                    </Form.Item>
                  </Col>
                  <Button
                    onClick={() => remove(name)}
                    icon={<DeleteOutlined />}
                  />
                </Row>
              ))}
              <Button
                type="link"
                className="padding-0"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Thêm mới
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ExpenseModal;
