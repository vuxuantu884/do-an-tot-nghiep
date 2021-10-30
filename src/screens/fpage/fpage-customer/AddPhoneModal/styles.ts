import styled from "styled-components";

export const StyledComponent = styled.div`
  .phone-add-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    .phone-input {
      flex: 1;
    }
    .ant-form-item {
      width: 100%;
      .ant-form-item-control {
        flex: unset !important;
      }
    }
  }
`;
