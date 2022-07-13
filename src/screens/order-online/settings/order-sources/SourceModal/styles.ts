import styled from "styled-components";

export const StyledComponent = styled.div`
  .footer {
    display: flex;
    &__create {
      justify-content: flex-end;
    }
    &__edit {
      justify-content: space-between;
    }
  }
  .ant-form-item:last-child {
    margin-bottom: 0;
  }
  .ant-row {
    margin-bottom: 20px;
  }
`;
