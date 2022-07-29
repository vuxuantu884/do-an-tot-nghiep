import { Form, Input, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { DiscountType } from "model/purchase-order/po-field";
import { useEffect, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

type PriceModalProps = {
  price: number;
  type: string;
  discount: number | null;
  onChange?: (price: number, type: string, discount: number) => void;
};

const PriceModal: React.FC<PriceModalProps> = (props: PriceModalProps) => {
  const [form] = Form.useForm();
  const [type, setType] = useState<string>(props.type);
  useEffect(() => {
    form.setFieldsValue({
      price: props.price,
      type: props.type,
      discount: props.discount === null ? 0 : props.discount,
    });
    setType(props.type);
  }, [form, props]);
  return (
    <div style={{ width: 200 }}>
      <Form
        form={form}
        onFinish={(value) => {
          props.onChange && props.onChange(value.price, value.type, value.discount);
        }}
        layout="vertical"
      >
        <Form.Item name="price" label="Đơn giá nhập">
          <NumberInput
            onBlur={() => {
              form.submit();
            }}
            min={0}
            default={0}
            maxLength={15}
            style={{ textAlign: "right" }}
            format={(a) => formatCurrency(a)}
            replace={(a) => replaceFormatString(a)}
            placeholder="Nhập đơn giá"
          />
        </Form.Item>
        <Form.Item label="Chiết khấu">
          <Input.Group className="product-item-discount" style={{ width: "100%" }} compact>
            <Form.Item noStyle name="type">
              <Select
                style={{ width: "35%" }}
                className="product-item-discount-select"
                onChange={(value: string) => {
                  setType(value);
                  form.setFieldsValue({ discount: 0 });
                }}
                onBlur={() => form.submit()}
              >
                <Select.Option value={DiscountType.percent}>%</Select.Option>
                <Select.Option value={DiscountType.money}>₫</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle name="discount">
              <NumberInput
                onBlur={() => {
                  form.submit();
                }}
                isFloat={true}
                default={0}
                className="product-item-discount-input"
                style={{ width: "65%", textAlign: "right" }}
                placeholder="Nhập chiết khấu"
                format={(a) => formatCurrency(a)}
                replace={(a) => replaceFormatString(a)}
                maxLength={type === "money" ? 15 : 3}
                min={0}
                max={type === "money" ? form.getFieldValue("price") : 100}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PriceModal;
