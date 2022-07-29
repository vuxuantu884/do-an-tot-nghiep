import Icon from "@ant-design/icons";
import React from "react";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { iconHelper } from "./helper";

type YdCoinProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};
const YdCoin = (props: YdCoinProps) => {
  const svg = () => (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99967 1.375C5.70326 1.375 2.20801 4.87025 2.20801 9.16667C2.20801 13.4631 5.70326 16.9583 9.99967 16.9583C14.2961 16.9583 17.7913 13.4631 17.7913 9.16667C17.7913 4.87025 14.2961 1.375 9.99967 1.375ZM9.99967 18.3333C4.94517 18.3333 0.833008 14.2212 0.833008 9.16667C0.833008 4.11217 4.94517 0 9.99967 0C15.0542 0 19.1663 4.11217 19.1663 9.16667C19.1663 14.2212 15.0542 18.3333 9.99967 18.3333Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.9996 2.36607C6.25004 2.36607 3.19967 5.41644 3.19967 9.166C3.19967 12.9156 6.25004 15.9659 9.9996 15.9659C13.7492 15.9659 16.7995 12.9156 16.7995 9.166C16.7995 5.41644 13.7492 2.36607 9.9996 2.36607ZM9.99967 17.1659C5.58852 17.1659 1.99976 13.5771 1.99976 9.16593C1.99976 4.75478 5.58852 1.16602 9.99967 1.16602C14.4108 1.16602 17.9996 4.75478 17.9996 9.16593C17.9996 13.5771 14.4108 17.1659 9.99967 17.1659Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        d="M9.9996 2.01607C6.05674 2.01607 2.84967 5.22314 2.84967 9.166H3.54967C3.54967 5.60974 6.44334 2.71607 9.9996 2.71607V2.01607ZM2.84967 9.166C2.84967 13.1089 6.05674 16.3159 9.9996 16.3159V15.6159C6.44334 15.6159 3.54967 12.7223 3.54967 9.166H2.84967ZM9.9996 16.3159C13.9425 16.3159 17.1495 13.1089 17.1495 9.166H16.4495C16.4495 12.7223 13.5559 15.6159 9.9996 15.6159V16.3159ZM17.1495 9.166C17.1495 5.22314 13.9425 2.01607 9.9996 2.01607V2.71607C13.5559 2.71607 16.4495 5.60974 16.4495 9.166H17.1495ZM9.99967 16.8159C5.78182 16.8159 2.34976 13.3838 2.34976 9.16593H1.64976C1.64976 13.7704 5.39522 17.5159 9.99967 17.5159V16.8159ZM2.34976 9.16593C2.34976 4.94808 5.78182 1.51602 9.99967 1.51602V0.816016C5.39522 0.816016 1.64976 4.56148 1.64976 9.16593H2.34976ZM9.99967 1.51602C14.2175 1.51602 17.6496 4.94808 17.6496 9.16593H18.3496C18.3496 4.56148 14.6041 0.816016 9.99967 0.816016V1.51602ZM17.6496 9.16593C17.6496 13.3838 14.2175 16.8159 9.99967 16.8159V17.5159C14.6041 17.5159 18.3496 13.7704 18.3496 9.16593H17.6496Z"
        fill="white"
      />
      <path
        d="M4.99976 6.16602L6.90113 10.0449V12.166H7.99564V10.0449L9.89702 6.16602H8.66252L7.47384 8.75H7.42293L6.23425 6.16602H4.99976Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        d="M12.4493 12.166C14.0376 12.166 14.9998 11.0352 14.9998 9.16016C14.9998 7.29102 14.0376 6.16602 12.4646 6.16602H10.6014V12.166H12.4493ZM11.7035 11.0791V7.25293H12.406C13.3835 7.25293 13.9002 7.82715 13.9002 9.16016C13.9002 10.499 13.3835 11.0791 12.4035 11.0791H11.7035Z"
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

export default YdCoin;
