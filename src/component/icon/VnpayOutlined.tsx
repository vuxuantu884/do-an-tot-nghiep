import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import Icon from "@ant-design/icons";
import { iconHelper } from "./helper";

type VnPayProps = {
  paymentData: OrderPaymentRequest[];
  method: PaymentMethodResponse;
};

const VnPayOutline = (props: VnPayProps) => {
  const svg = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 7H1.22205L2.24195 9.77311L3.113 7.47306C3.12954 7.38243 3.11484 7.35523 3.07809 7.27914C3.03214 7.18666 2.98069 7.09243 2.92924 7.0018H3.84072C3.78926 7.18851 3.70841 7.39332 3.64041 7.58543L2.46063 10.8171C2.13904 10.7555 1.78253 10.6358 1.50505 10.3857C1.29739 10.199 1.22205 9.98876 1.11914 9.73321L0.137826 7.2737C0.0992331 7.17217 0.0514554 7.08698 0 7ZM4.8698 8.29955V10.2806C4.8698 10.3603 4.89184 10.373 4.94516 10.4401L5.18222 10.7355H4.03551C4.09799 10.6394 4.16231 10.547 4.2303 10.4564C4.27808 10.3784 4.30013 10.3494 4.30013 10.2625V7.493L3.97671 7H5.16753L7.09338 9.34174V7.47306C7.09338 7.38243 7.07684 7.35523 7.02537 7.27914C6.9629 7.18666 6.89674 7.09243 6.82878 7.0018H7.97547L7.73841 7.29724C7.68509 7.36248 7.66855 7.37698 7.66855 7.45856V10.8297C7.2312 10.7736 6.82323 10.6757 6.46859 10.2389L4.8698 8.29955Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        d="M8.44231 10.1657V7.60831C8.44231 7.45059 8.42397 7.33096 8.38719 7.24943C8.35046 7.16785 8.28615 7.09356 8.1924 7.02647V7.01562H9.89222C10.2175 7.01562 10.4748 7.07181 10.6622 7.18419C10.8515 7.29657 10.9801 7.42884 11.0481 7.58111C11.1161 7.73333 11.1492 7.882 11.1492 8.02878C11.1492 8.62511 10.7964 8.98939 10.0926 9.12351L9.72687 9.15616C9.62028 9.14166 9.55042 9.13441 9.51369 9.13441C9.89222 8.98034 10.0797 8.6994 10.0797 8.29342C10.0797 7.80767 9.87938 7.56482 9.47691 7.56482V10.037C9.47691 10.3524 9.56516 10.5771 9.73971 10.7095V10.7312H8.19055V10.7203C8.35781 10.6116 8.44231 10.4267 8.44231 10.1657Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        d="M11.1548 9.88476L11.9394 7.68984C11.9891 7.54302 12.0129 7.43069 12.0129 7.35456C12.0129 7.23313 11.9413 7.12255 11.7998 7.02467V7.01562H13.213L14.3413 9.96635C14.4056 10.153 14.4699 10.298 14.536 10.3959C14.6004 10.4956 14.6941 10.5989 14.8172 10.7077V10.7294H13.0586V10.7077C13.2166 10.6206 13.2957 10.5137 13.2957 10.385C13.2957 10.3071 13.281 10.2255 13.2497 10.1422L13.0678 9.60567H11.9155L11.7465 10.0805C11.7079 10.1893 11.6822 10.2944 11.6675 10.3977C11.6675 10.4503 11.6858 10.5028 11.7208 10.5554C11.7557 10.6061 11.809 10.6587 11.8788 10.7095V10.7312H10.6917V10.7095C10.813 10.6098 10.903 10.5028 10.9599 10.3868C10.9875 10.3288 11.0169 10.2599 11.0463 10.1839C11.0776 10.1041 11.1144 10.0062 11.1548 9.88476ZM12.0846 9.07822H12.8803L12.4724 7.95269L12.0846 9.07822Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
      <path
        d="M15.4788 9.04018L14.3817 7.43429C14.3119 7.33101 14.2438 7.24398 14.174 7.17329C14.1171 7.12075 14.0546 7.07181 13.9847 7.02652V7.01562H15.3869L16.2451 8.35866L16.7321 7.67539C16.7798 7.60651 16.8166 7.52857 16.846 7.43794C16.8644 7.3745 16.8717 7.31832 16.8662 7.27302C16.8552 7.16969 16.789 7.08811 16.6677 7.02467V7.01562H18L16.563 9.04018V9.98809C16.563 10.028 16.5648 10.0678 16.5667 10.1041C16.5685 10.1404 16.5722 10.173 16.574 10.2002C16.5759 10.2364 16.5887 10.2998 16.6144 10.3869C16.642 10.5046 16.7137 10.6116 16.8295 10.7059V10.7276H15.2252V10.7059C15.3942 10.6225 15.4769 10.4467 15.4769 10.1748V9.04018H15.4788Z"
        fill={
          props.paymentData.some((p) => p.payment_method_code === props.method.code)
            ? iconHelper.hoverColor
            : iconHelper.normalColor
        }
      />
    </svg>
  );

  return (
    <Icon
      component={svg}
      style={{
        fontSize: 18,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}></Icon>
  );
};

export default VnPayOutline;
