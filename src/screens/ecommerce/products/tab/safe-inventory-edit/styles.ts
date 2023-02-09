import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-form-item-label > label {
    font-weight: normal;
  }
  .formInner {
    width: 200px;
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
    cursor: pointer;
    position: relative;
    margin: 0 0 0 10px;
    color: #00000040;
  }
  .noteText {
    text-align: left;
  }
  #available_minimum {
    text-align: left !important;
  }
  #available_minimum::-webkit-input-placeholder {
    text-align: left !important;
  }
`;
