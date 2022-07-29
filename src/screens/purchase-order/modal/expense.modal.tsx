import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { CostLine } from "model/purchase-order/cost-line.model";
import { POField } from "model/purchase-order/po-field";
import { useCallback, useEffect } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { POUtils } from "utils/POUtils";

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
    [form],
  );
  const onCancel = useCallback(
    (e) => {
      form.setFieldsValue({
        cost_lines: props.costLines,
      });
      props.onCancel && props.onCancel();
    },
    [form, props],
  );
  const onFinish = useCallback(
    (value) => {
      let cost_lines: Array<CostLine> = value.cost_lines;
      let result = [...cost_lines].filter(
        (item) => item.amount !== undefined && item.amount !== null && item.amount !== 0,
      );
      props.onOk(result);
    },
    [props],
  );
  useEffect(() => {
    if (props.visible) {
      form.resetFields();
      let cost_lines: Array<CostLine> = [...props.costLines];
      if (cost_lines.length === 0) {
        cost_lines.push({ title: "", amount: null });
      }
      form.setFieldsValue({
        cost_lines: cost_lines,
      });
    }
  }, [form, props.costLines, props.visible]);
  return (
    <Modal
      width={600}
      onCancel={onCancel}
      visible={props.visible}
      cancelText="Hủy"
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
                  <Col span={12} md={12}>
                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng thêm tên chi phí",
                        },
                      ]}
                      name={[name, "title"]}
                      fieldKey={[fieldKey, "title"]}
                    >
                      <Input placeholder="Tên chi phí(*)" />
                    </Form.Item>
                  </Col>
                  <Col span={9} md={9}>
                    <Form.Item name={[name, "amount"]} fieldKey={[fieldKey, "amount"]}>
                      <NumberInput
                        format={(a: string) => formatCurrency(a)}
                        replace={(a: string) => replaceFormatString(a)}
                        placeholder="VD: 100,000"
                        maxLength={15}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3} md={3}>
                    <Button onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Col>
                </Row>
              ))}
              <Row gutter={24} align="middle" justify="space-between">
                <Col span={12} md={12}>
                  <Button
                    type="link"
                    className="padding-0"
                    onClick={() => add({ title: "", amount: null })}
                    icon={<PlusOutlined />}
                  >
                    Thêm chi phí
                  </Button>
                </Col>
                <Col span={9} md={9}>
                  <Form.Item
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues[POField.cost_lines] !== curValues[POField.cost_lines]
                    }
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      let items = getFieldValue(POField.cost_lines);
                      return (
                        <div
                          style={{
                            textAlign: "right",
                            color: "#222222",
                            fontWeight: 700,
                          }}
                        >
                          Tổng chi phí: {formatCurrency(POUtils.getTotaExpense(items))}
                        </div>
                      );
                    }}
                  </Form.Item>
                </Col>
                <Col span={3} md={3}></Col>
              </Row>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ExpenseModal;
