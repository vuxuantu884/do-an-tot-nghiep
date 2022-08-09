import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-row {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  .iconEdit {
    margin-right: 5px;
    cursor: pointer;
    color: rgb(42, 42, 134);
  }
`;
