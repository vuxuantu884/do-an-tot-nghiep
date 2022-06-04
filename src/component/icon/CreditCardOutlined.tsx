import Icon from "@ant-design/icons";
import React from "react";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { iconHelper } from "./helper";

type CreditCardProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};
const CreditCardOutlined = (props: CreditCardProps) => {
  const svg = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M11.8125 10.875C11.6633 10.875 11.5202 10.9343 11.4148 11.0398C11.3093 11.1452 11.25 11.2883 11.25 11.4375C11.25 11.5867 11.3093 11.7298 11.4148 11.8352C11.5202 11.9407 11.6633 12 11.8125 12H13.6875C13.8367 12 13.9798 11.9407 14.0852 11.8352C14.1907 11.7298 14.25 11.5867 14.25 11.4375C14.25 11.2883 14.1907 11.1452 14.0852 11.0398C13.9798 10.9343 13.8367 10.875 13.6875 10.875H11.8125Z"
          fill={
            props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
          }
        />
        <path
          d="M2.475 3C1.81859 3 1.18906 3.24834 0.724911 3.69039C0.260758 4.13244 0 4.73199 0 5.35714V12.6429C0 13.268 0.260758 13.8676 0.724911 14.3096C1.18906 14.7517 1.81859 15 2.475 15H15.525C16.1814 15 16.8109 14.7517 17.2751 14.3096C17.7392 13.8676 18 13.268 18 12.6429V5.35714C18 4.73199 17.7392 4.13244 17.2751 3.69039C16.8109 3.24834 16.1814 3 15.525 3H2.475ZM1.35 12.6429V8.14286H16.65V12.6429C16.65 13.2343 16.146 13.7143 15.525 13.7143H2.475C1.854 13.7143 1.35 13.2343 1.35 12.6429ZM1.35 6.85714V5.35714C1.35 4.76571 1.854 4.28571 2.475 4.28571H15.525C16.146 4.28571 16.65 4.76571 16.65 5.35714V6.85714H1.35Z"
          fill={
            props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
          }
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  return <Icon component={svg}></Icon>;
};

export default CreditCardOutlined;
