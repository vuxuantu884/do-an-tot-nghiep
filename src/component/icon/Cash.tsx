import Icon from "@ant-design/icons";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";

type CashProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};

const Cash = (props: CashProps) => {
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
          d="M10.2857 7.71596C10.2857 8.39795 10.0148 9.052 9.53259 9.53423C9.05035 10.0165 8.3963 10.2874 7.71431 10.2874C7.03233 10.2874 6.37827 10.0165 5.89604 9.53423C5.4138 9.052 5.14288 8.39795 5.14288 7.71596C5.14288 7.03397 5.4138 6.37992 5.89604 5.89769C6.37827 5.41545 7.03233 5.14453 7.71431 5.14453C8.3963 5.14453 9.05035 5.41545 9.53259 5.89769C10.0148 6.37992 10.2857 7.03397 10.2857 7.71596ZM9.00003 7.71596C9.00003 7.37497 8.86457 7.04794 8.62345 6.80682C8.38233 6.5657 8.0553 6.43025 7.71431 6.43025C7.37332 6.43025 7.04629 6.5657 6.80517 6.80682C6.56406 7.04794 6.4286 7.37497 6.4286 7.71596C6.4286 8.05695 6.56406 8.38398 6.80517 8.6251C7.04629 8.86621 7.37332 9.00167 7.71431 9.00167C8.0553 9.00167 8.38233 8.86621 8.62345 8.6251C8.86457 8.38398 9.00003 8.05695 9.00003 7.71596Z"
          fill={
            props.paymentData.some((p) => p.code === props.method.code)
              ? "#2a2a86"
              : "black"
          }
        />
        <path
          d="M0 4.17941C0 3.29227 0.72 2.57227 1.60714 2.57227H13.8214C14.7086 2.57227 15.4286 3.29227 15.4286 4.17941V11.2508C15.4286 12.138 14.7086 12.858 13.8214 12.858H1.60714C0.72 12.858 0 12.138 0 11.2508V4.17941ZM1.60714 3.85798C1.52189 3.85798 1.44014 3.89184 1.37986 3.95212C1.31958 4.0124 1.28571 4.09416 1.28571 4.17941V5.14369H1.92857C2.09907 5.14369 2.26258 5.07596 2.38314 4.95541C2.5037 4.83485 2.57143 4.67133 2.57143 4.50084V3.85798H1.60714ZM1.28571 11.2508C1.28571 11.4283 1.42971 11.5723 1.60714 11.5723H2.57143V10.9294C2.57143 10.7589 2.5037 10.5954 2.38314 10.4748C2.26258 10.3543 2.09907 10.2866 1.92857 10.2866H1.28571V11.2508ZM3.85714 10.9294V11.5723H11.5714V10.9294C11.5714 10.4179 11.7746 9.92738 12.1363 9.5657C12.498 9.20402 12.9885 9.00084 13.5 9.00084H14.1429V6.42941H13.5C12.9885 6.42941 12.498 6.22622 12.1363 5.86454C11.7746 5.50287 11.5714 5.01233 11.5714 4.50084V3.85798H3.85714V4.50084C3.85714 5.01233 3.65395 5.50287 3.29228 5.86454C2.9306 6.22622 2.44006 6.42941 1.92857 6.42941H1.28571V9.00084H1.92857C2.44006 9.00084 2.9306 9.20402 3.29228 9.5657C3.65395 9.92738 3.85714 10.4179 3.85714 10.9294ZM12.8571 11.5723H13.8214C13.9067 11.5723 13.9884 11.5384 14.0487 11.4781C14.109 11.4178 14.1429 11.3361 14.1429 11.2508V10.2866H13.5C13.3295 10.2866 13.166 10.3543 13.0454 10.4748C12.9249 10.5954 12.8571 10.7589 12.8571 10.9294V11.5723ZM14.1429 5.14369V4.17941C14.1429 4.09416 14.109 4.0124 14.0487 3.95212C13.9884 3.89184 13.9067 3.85798 13.8214 3.85798H12.8571V4.50084C12.8571 4.67133 12.9249 4.83485 13.0454 4.95541C13.166 5.07596 13.3295 5.14369 13.5 5.14369H14.1429Z"
          fill={
            props.paymentData.some((p) => p.code === props.method.code)
              ? "#2a2a86"
              : "black"
          }
        />
        <path
          d="M4.50006 15.4303C4.09277 15.4305 3.69589 15.3017 3.3663 15.0624C3.03671 14.8231 2.79133 14.4856 2.66534 14.0983C2.84406 14.1292 3.02663 14.1446 3.21434 14.1446H13.8215C14.5887 14.1446 15.3245 13.8398 15.867 13.2973C16.4096 12.7548 16.7143 12.019 16.7143 11.2518V5.25391C17.0905 5.3869 17.4162 5.6333 17.6465 5.95913C17.8767 6.28497 18.0003 6.6742 18.0001 7.07319V11.2518C18.0001 11.8005 17.892 12.3439 17.682 12.8508C17.472 13.3578 17.1642 13.8184 16.7762 14.2065C16.3882 14.5945 15.9275 14.9023 15.4206 15.1123C14.9136 15.3223 14.3702 15.4303 13.8215 15.4303H4.50006Z"
          fill={
            props.paymentData.some((p) => p.code === props.method.code)
              ? "#2a2a86"
              : "black"
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

export default Cash;
