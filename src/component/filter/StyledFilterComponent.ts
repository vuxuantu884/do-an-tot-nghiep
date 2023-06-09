import styled from "styled-components";

export const StyledSelectDateFilter = styled.div`
  .select-date {
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 5px;

    .date-option {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0px;
        border-radius: 3px;
        background-color: #f5f5f5;
      }
      .ant-btn:hover {
        border-color: #2a2a86;
      }
      .active-btn {
        color: #ffffff;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2a2a86;
      }
    }

    .date-picker-styled {
      display: flex;
      align-items: center;
      .ant-form-item {
        flex-grow: 1;
        margin: 0;
      }
      .date-picker-select {
        flex-grow: 1;
        .ant-picker {
          width: 100%;
        }
      }
    }
  }
`;
