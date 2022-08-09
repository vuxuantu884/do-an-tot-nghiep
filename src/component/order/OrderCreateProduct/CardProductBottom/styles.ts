import styled from "styled-components";

export const StyledComponent = styled.div`
  padding-top: 15px;

  .paymentRow {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .optionRow {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  .ant-divider-horizontal {
    margin: 12px 0;
  }
`;
