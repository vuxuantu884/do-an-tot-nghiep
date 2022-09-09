import { Button, Col, Form, FormInstance, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import {
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueOtherPaymentTypeArrModel,
} from "model/order/daily-revenue.model";
import React, { useEffect } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { ShopCostOrSurchargeModel } from "../ShopCostAndSurchargeCard";
import { StyledComponent } from "./styles";

export enum AmountItemTypeModel {
  cost = "cost",
  payment = "payment",
}

type PropTypes = {
  isVisible: boolean;
  handleOkForm: (values: DailyRevenueOtherPaymentParamsModel, form: FormInstance<any>) => void;
  handleCancelForm: () => void;
  initialValues: DailyRevenueOtherPaymentParamsModel;
  form: FormInstance<any>;
  cardType: ShopCostOrSurchargeModel;
  dailyRevenueOtherPaymentTypes: DailyRevenueOtherPaymentTypeArrModel | undefined;
};

function DailyRevenueCardAddItem(props: PropTypes) {
  const {
    isVisible,
    handleOkForm,
    handleCancelForm,
    initialValues,
    form,
    cardType,
    dailyRevenueOtherPaymentTypes,
  } = props;

  const onFinish = (values: DailyRevenueOtherPaymentParamsModel) => {
    handleOkForm(values, form);
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <StyledComponent>
      <Form form={form} onFinish={onFinish} initialValues={initialValues} hidden={!isVisible}>
        <div className="formWrapper">
          <Row gutter={10}>
            <Col span={7}>
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: `Vui lòng nhập tên ${
                      cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"
                    }!`,
                  },
                ]}
              >
                <Input
                  placeholder={`Tên ${
                    cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"
                  }`}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name={
                  cardType === ShopCostOrSurchargeModel.cost
                    ? AmountItemTypeModel.cost
                    : AmountItemTypeModel.payment
                }
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!value || +value <= 0) {
                        return Promise.reject(
                          new Error(
                            `Vui lòng nhập số tiền ${
                              cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"
                            }!`,
                          ),
                        );
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
            <Col span={5}>
              <Form.Item
                name="type"
                rules={[
                  {
                    required: true,
                    message: `Vui lòng chọn loại ${
                      cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"
                    }!`,
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
            <Col span={7}>
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

export default DailyRevenueCardAddItem;
