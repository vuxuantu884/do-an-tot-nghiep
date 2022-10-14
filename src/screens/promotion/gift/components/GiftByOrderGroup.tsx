import React, { ReactElement, useContext } from "react";
import { Card, Col, Divider, FormInstance } from "antd";
import GeneralOrderThreshold from "screens/promotion/shared/general-order-threshold";
import { GiftContext } from "screens/promotion/gift/components/GiftProvider";
import GiftProduct from "screens/promotion/gift/components/GiftProduct";

interface Props {
  form: FormInstance;
}

export default function GiftByOrderGroup(props: Props): ReactElement {
  const { form } = props;

  const giftContext = useContext(GiftContext);
  const { giftDetailData } = giftContext;

  return (
    <Col span={24}>
      <Card style={{ boxShadow: "none" }}>
        <GeneralOrderThreshold form={form} priceRuleData={giftDetailData} />
        <Divider style={{ margin: "20px 0" }} />
        <GiftProduct name={0} form={form} />
      </Card>
    </Col>
  );
}
