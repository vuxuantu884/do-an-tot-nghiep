import styled from "styled-components";
import { primaryColor, textBodyColor } from "utils/global-styles/variables";
import { Select } from "antd";

export const StyledComponent = styled.div`
  .ant-form {
    .ant-form-item {
      margin: 0 0 15px;

      .ant-form-item-label {
        padding: 0;
      }
    }
  }

  .typeOrder {
    width: 100%;
  }

  .formInner {
    width: 300px;
    max-width: 100%;
  }

  .buttonWrapper {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;

    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }

  .iconEdit {
    margin-right: 5px;
    cursor: pointer;
  }

  .noteText {
    text-align: left;
  }

  .promotionText {
    color: ${primaryColor};
    font-size: 0.93rem;
    font-weight: 500;
    margin-right: 3px;
    font-style: italic;
  }

  .iconGift {
    margin-right: 3px;
    position: relative;
    margin-top: -3px;
  }
  .ordersSpecialDetail {
    font-size: 0.86em;
    label {
      font-weight: 500;
      color: ${textBodyColor};
    }
  }
`;

export const SelectMultipleStyle = styled(Select)`
  padding: 0;
  .ant-select-selector {
    height: auto !important;
  }
  .ant-select-selection-item {
    margin: 1px 2px;
  }
`;
