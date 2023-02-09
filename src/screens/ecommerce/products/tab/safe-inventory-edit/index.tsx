import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Popover } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { useEffect, useState } from "react";
import { formatCurrencyForProduct } from "screens/products/helper";
import { replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type FormValueType = {
  [key: string]: any;
};
type PropTypes = {
  onOk: (values: FormValueType) => void;
  value: FormValueType;
};

function SafeInventoryEdit(props: PropTypes) {
  const { onOk, value } = props;

  const [form] = Form.useForm();

  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
    if (!visible) {
      form.resetFields();
    }
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        available_minimum: value,
      });
    }
  }, [form, value, visible]);

  return (
    <StyledComponent>
      <div className="wrapper">
        <Popover
          content={
            <StyledComponent>
              <Form form={form} layout="vertical">
                <div className="formInner">
                  <Form.Item name="available_minimum">
                    <NumberInput
                      format={(a: string) => formatCurrencyForProduct(a, ",")}
                      replace={(a: string) => replaceFormatString(a)}
                      maxLength={4}
                    />
                  </Form.Item>
                  <div className="buttonWrapper">
                    <Button
                      onClick={() => {
                        setVisible(false);
                      }}
                    >
                      Huỷ
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        onSubmit();
                        setVisible(false);
                      }}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              </Form>
            </StyledComponent>
          }
          title="Sửa cấu hình tồn an toàn"
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          <EditOutlined className="iconEdit" style={{}} title="Sửa cấu hình tồn an toàn" />
        </Popover>
      </div>
    </StyledComponent>
  );
}

export default SafeInventoryEdit;
