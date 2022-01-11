import styled from "styled-components";
import { dangerColor } from "utils/global-styles/variables";

export const StyledSelectDateFilter = styled.div`
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

export const StyledStatus = styled.div`
  .green-status {
    background: #F0FCF5;
    color: #27AE60;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0px auto;
  }

  .red-status {
    background: rgba(226, 67, 67, 0.1);
    color: #E24343;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0px auto;
  }
  
  .yellow-status {
    background: #FFFAF0;
    color: #FCAF17;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0px auto;
  }

  .blue-status {
    background: rgba(42, 42, 134, 0.1);
    color: #2A2A86;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0px auto;
  }

  .gray-status {
    background: rgba(102, 102, 102, 0.1);
    color: #666666;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0px auto;
  }
`;

export const StyledModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  .ant-btn-dangerous {
    &:hover {
      color: white;
      background-color: ${dangerColor};
    }
  }
`;

export const StyledProgressDownloadModal = styled.div`
  .progress-body {
    width: 80%;
    margin: 0 auto;
    .progress-count {
      display: flex;
      justify-content: space-between;
      text-align: center;
      .total-count {
        font-weight: 700;
        color: "#2222222";
      }
      .total-created {
        font-weight: 700;
        color: #FCAF17;
      }
      .total-updated {
        font-weight: 700;
        color: #27AE60;
      }
      .total-error {
        font-weight: 700;
        color: #E24343;
      }
    }
  }

  .error-orders {
    .title {
      margin: 20px 0;
      font-weight: bold;
    }
    .custom-table {
      height: 300px;
      overflow-y: scroll;
    }
  }
  
`;