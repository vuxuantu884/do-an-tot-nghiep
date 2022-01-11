import {
  Col, FormInstance
} from "antd";
import React, { ReactElement, useContext } from "react";
import GeneralOrderThreshold from "screens/promotion/shared/general-order-threshold";
import { DiscountContext } from "./discount-provider";
import InputiscountOrderThreshold from "./input-discount-order-threshold";



interface Props {
  form: FormInstance;
}


export default function DiscountTypeOrderThreshold(props: Props): ReactElement {
  const { form } = props;

  const discountUpdateContext = useContext(DiscountContext);
  const { discountData } = discountUpdateContext;




  return (
    <Col span={24}>
      <GeneralOrderThreshold form={form} priceRuleData={discountData} />
      <InputiscountOrderThreshold form={form} />
    </Col>
  );
}
