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
        padding: 0 10px;
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
  }
`;
