import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { CostLine } from "model/purchase-order/cost-line.model";
import { useCallback, useEffect } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

type ExpenseModalType = {
  visible: boolean;
  onCancel: () => void;
  onOk: (result: Array<CostLine>) => void;
  costLines: Array<CostLine>;
};

const ExpenseModal: React.FC<ExpenseModalType> = (props: ExpenseModalType) => {
  const [form] = Form.useForm();
  const onOk = useCallback(
    (e) => {
      form.submit();
    },
    [form]
  );
  const onCancel = useCallback(
    (e) => {
      form.setFieldsValue({
        cost_lines: props.costLines,
      });
      props.onCancel && props.onCancel();
    },
    [form, props]
  );
  const onFinish = useCallback(
    (value) => {
      let cost_lines: Array<CostLine> = value.cost_lines;
      props.onOk(cost_lines);
    },
    [props]
  );
  useEffect(() => {
    if (props.visible) {
      let cost_lines: Array<CostLine> = form.getFieldValue("cost_lines");
      if (cost_lines.length === 0) {
        cost_lines.push({ title: "", amount: 0 });
        form.setFieldsValue({
          cost_lines: cost_lines
        })
      }
    }
  }, [form, props.visible]);
  return (
    <Modal
      width={600}
      onCancel={onCancel}
      visible={props.visible}
      cancelText="Thoát"
      okText="Áp dụng"
      onOk={onOk}
      title="Thêm chi phí"
    >
      <Form
        onFinish={onFinish}
        form={form}
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
