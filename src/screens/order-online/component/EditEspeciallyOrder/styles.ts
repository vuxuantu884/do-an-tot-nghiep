import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-form-item {
    margin: 0 0 17px;
  }
  .ant-input-affix-wrapper {


    > input.ant-input {
      height: 28px;
    }
  }
  .ant-form-item-label {
    padding: 0 0 5px
  }

  .formInner {
    width: 300px;
    max-width: 100%;

    .select-especially-order {
      width: 100%;
    }

    .ant-select-selector {
      height: 30px;
    }

    .ant-select-selection-item {
      line-height: 30px !important;
    }

    .ant-select-selection-placeholder {
      line-height: 30px !important;
    }
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
`;
