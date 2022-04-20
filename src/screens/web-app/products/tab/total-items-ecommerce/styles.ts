import styled from "styled-components";

export const StyledComponent = styled.div`
  .filter {
    .action-dropdown {
      width: 110px;
      margin-right: 10px;
      .action-button {
        padding: 6px 15px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        color: $primary-color;
        &:hover {
          color: $primary-color;
          border: 1px solid $primary-color;
          color: $primary-color;
        }
      }
    }
  }
`

export const StyledBaseFilter = styled.div`
  .select-connection-date {
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 5px;

    .date-option {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0 10px;
        border-radius: 3px;
        background-color: #f5f5f5;
      }
      .ant-btn:hover {
        border-color: #2A2A86;
      }
      .active-btn {
        color: #FFFFFF;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2A2A86;
      }
    }

  }
`;
