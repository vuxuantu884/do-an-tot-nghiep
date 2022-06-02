import Icon from "@ant-design/icons";
import React from "react";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";

type MomoProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};

const MomoOutlined = (props: MomoProps) => {
  const svg = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.04736 3C8.60249 3 9.02574 3.16654 9.31721 3.49961C9.61556 3.82574 9.76475 4.35656 9.76475 5.09211V7.65259C9.76475 7.85383 9.70232 8.00995 9.57742 8.12101C9.45943 8.22509 9.30331 8.27713 9.10905 8.27713C8.92166 8.27713 8.76554 8.22509 8.64063 8.12101C8.5227 8.00995 8.46368 7.85383 8.46368 7.65259V5.09211C8.46368 4.71046 8.39433 4.43986 8.25552 4.28025C8.12369 4.11371 7.91899 4.03044 7.64142 4.03044C7.30142 4.03044 7.03078 4.14841 6.82954 4.38431C6.62835 4.6133 6.52773 4.92906 6.52773 5.33153V7.65259C6.52773 7.85383 6.46526 8.00995 6.34035 8.12101C6.22242 8.22509 6.06976 8.27713 5.88237 8.27713C5.69503 8.27713 5.53891 8.22509 5.414 8.12101C5.28909 8.00995 5.22666 7.85383 5.22666 7.65259V5.09211C5.22666 4.71046 5.15726 4.43986 5.01845 4.28025C4.88662 4.11371 4.68192 4.03044 4.40435 4.03044C4.06435 4.03044 3.79374 4.14841 3.59251 4.38431C3.39822 4.6133 3.30107 4.92906 3.30107 5.33153V7.65259C3.30107 7.85383 3.23862 8.00995 3.11371 8.12101C2.98881 8.22509 2.83268 8.27713 2.64533 8.27713C2.45798 8.27713 2.30185 8.22509 2.17695 8.12101C2.05898 8.00995 2 7.85383 2 7.65259V3.62451C2 3.43022 2.06245 3.28103 2.18736 3.17694C2.31226 3.07286 2.46839 3.02082 2.65574 3.02082C2.83616 3.02082 2.98187 3.07286 3.0929 3.17694C3.21086 3.27409 3.26984 3.41634 3.26984 3.60369V3.8535C3.42944 3.57594 3.64108 3.3643 3.90476 3.21858C4.17536 3.07286 4.48419 3 4.83111 3C5.59441 3 6.10443 3.3192 6.36117 3.95759C6.51383 3.66614 6.73936 3.43369 7.03775 3.26021C7.3361 3.08674 7.67263 3 8.04736 3Z"
        fill={
          props.paymentData.some((p) => p.code === props.method.code)
            ? "#2a2a86"
            : "black"
        }
      />
      <path
        d="M13.4083 8.29796C12.8878 8.29796 12.4299 8.19036 12.0344 7.97528C11.6458 7.76019 11.3439 7.45141 11.1288 7.04893C10.9137 6.64645 10.8062 6.17809 10.8062 5.64378C10.8062 5.10947 10.9137 4.64456 11.1288 4.24902C11.3439 3.84656 11.6458 3.53777 12.0344 3.32266C12.4299 3.10755 12.8878 3 13.4083 3C13.9287 3 14.3832 3.10755 14.7718 3.32266C15.1673 3.53777 15.4691 3.84656 15.6773 4.24902C15.8924 4.64456 16 5.10947 16 5.64378C16 6.17809 15.8924 6.64645 15.6773 7.04893C15.4691 7.45141 15.1673 7.76019 14.7718 7.97528C14.3832 8.19036 13.9287 8.29796 13.4083 8.29796ZM13.3979 7.28831C13.8212 7.28831 14.1438 7.14955 14.3659 6.87198C14.5879 6.59441 14.6989 6.18501 14.6989 5.64378C14.6989 5.10947 14.5879 4.70353 14.3659 4.42596C14.1438 4.14147 13.8246 3.99922 13.4083 3.99922C12.9919 3.99922 12.6693 4.14147 12.4403 4.42596C12.2182 4.70353 12.1072 5.10947 12.1072 5.64378C12.1072 6.18501 12.2182 6.59441 12.4403 6.87198C12.6623 7.14955 12.9815 7.28831 13.3979 7.28831Z"
        fill={
          props.paymentData.some((p) => p.code === props.method.code)
            ? "#2a2a86"
            : "black"
        }
      />
      <path
        d="M8.04736 10.4375C8.60249 10.4375 9.02574 10.6041 9.31721 10.9371C9.61556 11.2633 9.76475 11.7941 9.76475 12.5296V15.0902C9.76475 15.2913 9.70232 15.4475 9.57742 15.5585C9.45943 15.6626 9.30331 15.7146 9.10905 15.7146C8.92166 15.7146 8.76554 15.6626 8.64063 15.5585C8.5227 15.4475 8.46368 15.2913 8.46368 15.0902V12.5296C8.46368 12.148 8.39433 11.8774 8.25552 11.7178C8.12369 11.5512 7.91899 11.468 7.64142 11.468C7.30142 11.468 7.03078 11.5859 6.82954 11.8219C6.62835 12.0509 6.52773 12.3666 6.52773 12.769V15.0902C6.52773 15.2913 6.46526 15.4475 6.34035 15.5585C6.22242 15.6626 6.06976 15.7146 5.88237 15.7146C5.69503 15.7146 5.53891 15.6626 5.414 15.5585C5.28909 15.4475 5.22666 15.2913 5.22666 15.0902V12.5296C5.22666 12.148 5.15726 11.8774 5.01845 11.7178C4.88662 11.5512 4.68192 11.468 4.40435 11.468C4.06435 11.468 3.79374 11.5859 3.59251 11.8219C3.39822 12.0509 3.30107 12.3666 3.30107 12.769V15.0902C3.30107 15.2913 3.23862 15.4475 3.11371 15.5585C2.98881 15.6626 2.83268 15.7146 2.64533 15.7146C2.45798 15.7146 2.30185 15.6626 2.17695 15.5585C2.05898 15.4475 2 15.2913 2 15.0902V11.062C2 10.8677 2.06245 10.7185 2.18736 10.6144C2.31226 10.5104 2.46839 10.4583 2.65574 10.4583C2.83616 10.4583 2.98187 10.5104 3.0929 10.6144C3.21086 10.7116 3.26984 10.8539 3.26984 11.0412V11.291C3.42944 11.0135 3.64108 10.8018 3.90476 10.6561C4.17536 10.5104 4.48419 10.4375 4.83111 10.4375C5.59441 10.4375 6.10443 10.7567 6.36117 11.3951C6.51383 11.1036 6.73936 10.8712 7.03775 10.6978C7.3361 10.5243 7.67263 10.4375 8.04736 10.4375Z"
        fill={
          props.paymentData.some((p) => p.code === props.method.code)
            ? "#2a2a86"
            : "black"
        }
      />
      <path
        d="M13.4083 15.7355C12.8878 15.7355 12.4299 15.6279 12.0344 15.4128C11.6458 15.1977 11.3439 14.8889 11.1288 14.4864C10.9137 14.084 10.8062 13.6156 10.8062 13.0813C10.8062 12.547 10.9137 12.0821 11.1288 11.6865C11.3439 11.2841 11.6458 10.9753 12.0344 10.7602C12.4299 10.5451 12.8878 10.4375 13.4083 10.4375C13.9287 10.4375 14.3832 10.5451 14.7718 10.7602C15.1673 10.9753 15.4691 11.2841 15.6773 11.6865C15.8924 12.0821 16 12.547 16 13.0813C16 13.6156 15.8924 14.084 15.6773 14.4864C15.4691 14.8889 15.1673 15.1977 14.7718 15.4128C14.3832 15.6279 13.9287 15.7355 13.4083 15.7355ZM13.3979 14.7258C13.8212 14.7258 14.1438 14.5871 14.3659 14.3095C14.5879 14.0319 14.6989 13.6225 14.6989 13.0813C14.6989 12.547 14.5879 12.141 14.3659 11.8635C14.1438 11.579 13.8246 11.4368 13.4083 11.4368C12.9919 11.4368 12.6693 11.579 12.4403 11.8635C12.2182 12.141 12.1072 12.547 12.1072 13.0813C12.1072 13.6225 12.2182 14.0319 12.4403 14.3095C12.6623 14.5871 12.9815 14.7258 13.3979 14.7258Z"
        fill={
          props.paymentData.some((p) => p.code === props.method.code)
            ? "#2a2a86"
            : "black"
        }
      />
    </svg>
  );

  return <Icon component={svg}></Icon>;
};
export default MomoOutlined;
