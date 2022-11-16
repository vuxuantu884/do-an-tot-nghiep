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
    background: #f0fcf5;
    color: #27ae60;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .red-status {
    background: rgba(226, 67, 67, 0.1);
    color: #e24343;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .yellow-status {
    background: #fffaf0;
    color: #fcaf17;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .blue-status {
    background: rgba(42, 42, 134, 0.1);
    color: #2a2a86;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .gray-status {
    background: rgba(102, 102, 102, 0.1);
    color: #666666;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
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

export const StyledModalFooterSingle = styled.div`
  display: flex;
  justify-content: end;
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
        color: #222222;
      }
      .total-created {
        font-weight: 700;
        color: #fcaf17;
      }
      .total-updated {
        font-weight: 700;
        color: #27ae60;
      }
      .total-error {
        font-weight: 700;
        color: #e24343;
      }
    }
  }

  .error-orders {
    .title {
      margin: 20px 0;
      font-weight: bold;
    }
    .error_message {
      max-height: 300px;
      overflow-y: scroll;
    }
  }

  .status {
    margin-top: 20px !important;
    width: 85%;
    margin: 0 auto;
    .ant-col.ant-col-6 {
      text-align: center;
    }
  }

  .ant-upload-text {
    color: rgba(0, 0, 0, 0.85);
  }

  .import-info {
    flex-direction: column;
    text-align: left;
    margin-top: 30px;
    max-width: 100%;

    & .content {
      padding: 10px 15px;
      background-color: #f5f5f5;

      ul {
        list-style: none;
        li {
          span {
            &.danger {
              color: #ff4d4f;
            }
            &.success {
              color: #52c41a;
            }
            margin-right: 10px;
          }
        }
      }
    }
  }
`;
