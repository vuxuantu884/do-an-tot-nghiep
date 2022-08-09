import styled from "styled-components";
import { borderRadius } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .orders-tag {
    margin-left: 10px;
  }
  .momoButton {
    margin-top: 15px;
    height: 28px;
    line-height: 28px;
    padding: 0 15px;
    border-radius: ${borderRadius};
    &:not(:last-child) {
      margin-right: 5px;
    }
  }
  .paymentMethod {
    max-width: 80%;
  }
  .ant-collapse-header {
    padding-right: 0 !important;
  }
  .momoShortLink {
    &:hover {
      text-decoration: underline;
    }
  }
  .iconCopy {
    position: relative;
    top: -2px;
  }
  .paymentTitle {
    font-weight: bold;
    a {
      font-weight: normal;
      word-break: break-all;
    }
  }
  .momoReference {
    font-weight: normal;
    word-break: break-all;
  }
`;
