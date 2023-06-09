import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .order-filter-tags {
    margin-bottom: 20px;
    .tag {
      padding: 4px 10px;
      margin-bottom: 15px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
    }
    .tagLabel {
      margin-right: 5px;
    }
    a {
      color: ${primaryColor};
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .ant-radio-group-solid
    .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):active,
  .ant-radio-button-wrapper-checked:not([class*=" ant-radio-button-wrapper-disabled"]).ant-radio-button-wrapper:first-child {
    background: none;
  }
`;
