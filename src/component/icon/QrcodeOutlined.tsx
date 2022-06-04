import Icon from "@ant-design/icons";
import React from "react";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { iconHelper } from "./helper";

type QrcodeProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};
const QrcodeOutlined = (props : QrcodeProps) => {
  const svg = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.25 2.25H15.75V6H14.25V3.75H11.25V2.25ZM6.75 2.25V3.75H3.75V6H2.25V2.25H6.75ZM11.25 15.75V14.25H14.25V12H15.75V15.75H11.25ZM6.75 15.75H2.25V12H3.75V14.25H6.75V15.75ZM2.25 8.25H15.75V9.75H2.25V8.25Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
    </svg>
  );

  return <Icon component={svg}></Icon>;
};

export default QrcodeOutlined;
