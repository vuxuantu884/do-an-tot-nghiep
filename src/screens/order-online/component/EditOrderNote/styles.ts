import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-form-item-label > label {
    font-weight: normal;
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
`;
