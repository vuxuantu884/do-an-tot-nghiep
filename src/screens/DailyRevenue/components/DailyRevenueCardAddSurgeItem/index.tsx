import { Button, Col, Form, FormInstance, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import {
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueOtherPaymentTypeArrModel,
} from "model/order/daily-revenue.model";
import { useEffect } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import { getArrayFromObject } from "utils/OrderUtils";
import { DailyRevenuePaymentMethods } from "screens/DailyRevenue/helper";

type Props = {
  isVisible: boolean;
  handleOkForm: (values: DailyRevenueOtherPaymentParamsModel, form: FormInstance<any>) => void;
  handleCancelForm: () => void;
  initialValues: DailyRevenueOtherPaymentParamsModel;
  form: FormInstance<any>;
  dailyRevenueOtherPaymentTypes: DailyRevenueOtherPaymentTypeArrModel | undefined;
};

function DailyRevenueCardAddSurgeItem(props: Props) {
  const {
    isVisible,
    handleOkForm,
    handleCancelForm,
    initialValues,
    form,
    dailyRevenueOtherPaymentTypes,
  } = props;

  const onFinish = (values: DailyRevenueOtherPaymentParamsModel) => {
    handleOkForm(values, form);
  };

  const DailyRevenuePaymentMethodsArr = getArrayFromObject(DailyRevenuePaymentMethods);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <StyledComponent>
      <Form form={form} onFinish={onFinish} initialValues={initialValues} hidden={!isVisible}>
        <div className="formWrapper">
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: `Vui lòng nhập tên phụ thu!`,
                  },
                ]}
              >
                <Input placeholder={`Tên phụ thu`} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="payment"
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!value || +value <= 0) {
                        return Promise.reject(new Error(`Vui lòng nhập số tiền phụ thu!`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <NumberInput
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="Số tiền"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="method"
                rules={[
                  {
                    required: true,
                    message: `Vui lòng chọn kiểu thanh toán!`,
                  },
                ]}
              >
                <CustomSelect
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Kiểu thanh toán"
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {(DailyRevenuePaymentMethodsArr || []).map((item, index) => (
                    <Select.Option key={item.value} value={item.value} className="paymentSelect">
                      <StyledComponent>
                        <div className="select" title={item.title}>
                          <img src={item.iconUrl} alt="" className="paymentSelectIcon" />
                          {item.title}
                        </div>
                      </StyledComponent>
                    </Select.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="type"
                rules={[
                  {
                    required: true,
                    message: `Vui lòng chọn loại phụ thu!`,
                  },
                ]}
              >
                <CustomSelect
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn loại"
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {(dailyRevenueOtherPaymentTypes || []).map((item, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item.title}
                    </Select.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="description">
                <Input placeholder="Mô tả" />
              </Form.Item>
            </Col>
          </Row>
          <div className="buttonGroup">
            <Button onClick={() => handleCancelForm()}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </div>
      </Form>
    </StyledComponent>
  );
}

export default DailyRevenueCardAddSurgeItem;
