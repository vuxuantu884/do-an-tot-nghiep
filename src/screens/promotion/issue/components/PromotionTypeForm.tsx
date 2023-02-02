import { Card, Checkbox, Col, Form, Radio, Row, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import {
  PriceRuleMethod,
  ReleasePromotionListType,
} from "model/promotion/price-rules.model";
import React, { ReactElement, useContext } from "react";
import { PRICE_RULE_FIELDS } from "screens/promotion/constants";
import GeneralOrderThreshold from "screens/promotion/shared/general-order-threshold";
import GeneralProductQuantity from "screens/promotion/shared/general-product-quantity";
import { IssueContext } from "screens/promotion/issue/components/issue-provider";
import IssueTypeForm from "./issue-type-form";
const { Option } = Select;
interface Props {
  form: FormInstance;
  defaultReleasePromotionListType?: string;
}

function PromotionTypeForm(props: Props): ReactElement {
  const { form, defaultReleasePromotionListType } = props;
  const {
    priceRuleData,
    promotionType,
    setPromotionType,
    releasePromotionListType,
    setReleasePromotionListType,
    isSmsVoucher,
    setIsSmsVoucher,
  } = useContext(IssueContext);

  const handleChangePromotionMethod = (value: string) => {
    setPromotionType(value);
  };

  const handleChangeReleasePromotionList = (value: string) => {
    setReleasePromotionListType(value);
  };
  const handleChangeSmsVoucherCheckbox = (value: any) => {
    setIsSmsVoucher(value.target.checked);
    form.setFieldsValue({
      [PRICE_RULE_FIELDS.is_sms_voucher]: value.target.checked,
    });
  };

  return (
    <div>
      <Card title="Loại khuyến mãi">
        <Row gutter={30}>
          {/*Tạm ẩn Checkbox "Khuyến mãi tặng mã giảm giá qua sms"*/}

          {/*<Col span={24}>*/}
          {/*  <Form.Item name={PRICE_RULE_FIELDS.is_sms_voucher}>*/}
          {/*    <Checkbox*/}
          {/*      checked={isSmsVoucher}*/}
          {/*      onChange={handleChangeSmsVoucherCheckbox}*/}
          {/*    >*/}
          {/*      Khuyến mãi tặng mã giảm giá qua sms*/}
          {/*    </Checkbox>*/}
          {/*  </Form.Item>*/}
          {/*</Col>*/}

          {/* Loại khuyến mãi */}
          <Col span={24}>
            <Form.Item label="Chọn loại" name={PRICE_RULE_FIELDS.entitled_method}>
              <Select
                showArrow
                placeholder="Chọn loại mã khuyến mãi"
                value={promotionType}
                onChange={(value: string) => handleChangePromotionMethod(value)}
              >
                <Option
                  key={PriceRuleMethod.ORDER_THRESHOLD}
                  value={PriceRuleMethod.ORDER_THRESHOLD}
                >
                  Khuyến mãi theo đơn hàng
                </Option>
                <Option
                  key={PriceRuleMethod.DISCOUNT_CODE_QTY}
                  value={PriceRuleMethod.DISCOUNT_CODE_QTY}
                >
                  Khuyến mãi theo sản phẩm
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <IssueTypeForm form={form} />
          </Col>
        </Row>
      </Card>

      {promotionType === PriceRuleMethod.ORDER_THRESHOLD ? (
        <Card title="Điều kiện áp dụng">
          <GeneralOrderThreshold form={form} priceRuleData={priceRuleData} />
        </Card>
      ) : (
        <Card title="Danh sách áp dụng">
          <Form.Item name="operator">
            <Radio.Group
              defaultValue={
                defaultReleasePromotionListType
                  ? defaultReleasePromotionListType
                  : ReleasePromotionListType.EQUALS
              }
              value={releasePromotionListType}
              onChange={(e) => handleChangeReleasePromotionList(e.target.value)}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Radio value={ReleasePromotionListType.EQUALS}>Tìm kiếm/ Nhập file</Radio>
              <Radio value={ReleasePromotionListType.NOT_EQUAL_TO} style={{ padding: "10px 0" }}>
                Tất cả sản phẩm (kèm danh sách loại trừ)
              </Radio>
              <Radio value={ReleasePromotionListType.OTHER_CONDITION}>Danh sách có điều kiện</Radio>
            </Radio.Group>
          </Form.Item>

          <GeneralProductQuantity form={form} />
        </Card>
      )}
    </div>
  );
}

export default PromotionTypeForm;
