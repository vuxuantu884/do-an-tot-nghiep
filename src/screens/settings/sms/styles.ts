import styled from "styled-components";
import { dangerColor, primaryColor } from "utils/global-styles/variables";

export const StyledSmsSetting = styled.div`
  .sms-settings {
    .row-item {
      display: flex;
      justify-content: space-between;
      .ant-form-item {
        margin-bottom: 20px;
      }
      &:last-child {
        .ant-form-item {
          margin-bottom: 0;
        }
      }
      .left-item {
        width: 50%;
        margin-right: 15px;
      }
      .right-item {
        width: 50%;
        margin-left: 15px;
      }
    }
  }
  
  .sms-action-setting {
    .message-content {
      padding: 0 !important;
      div {
        padding: 12px;
      }
      div:not(:last-child) {
        border-bottom: 1px solid #ddd;
      }
    }
  }
  
`;

export const StyledSmsConfigMessage = styled.div`
  .sms-config-message {
    display: flex;
    justify-content: space-between;
    .edit-content {
      width: 65%;
      margin-right: 20px;
      .action-status {
        flex-direction: row;
        align-items: center;
        .ant-form-item-label {
          padding: 0;
        }
        .switch-button {
          margin: 0 10px;
        }
      }

      .sms-content {
        margin: 20px 0;
        .text-area-input-content {
          padding-right: 20px;
        }
        .warning-border {
          border: 1px solid red;
        }
      }

      .sms-form-footer {
        display: flex;
        justify-content: space-between;
        .add-button {
          border: 1px solid ${primaryColor};
          color: ${primaryColor};
          &:hover {
            font-weight: bold;
            background: #F3F3FF;
          }
        }
        .delete-button {
          border: 1px solid ${dangerColor};
          color: ${dangerColor};
          &:hover {
            font-weight: bold;
            background: rgba(226, 67, 67, 0.1);
          }
        }
      }
    }
    .key-word-list {
      flex-grow: 1;
      position: sticky;
      top: 75px;
      height: fit-content;
      .key-word-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .insert-button {
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
`;

export const StyledPromotionModal = styled.div`
  .promotion-modal-body {
    height: 580px;
    overflow: auto;
    padding: 12px;
  }

  .key-word {
    button {
      background: #F3F3FF;
      border: 1px solid ${primaryColor};
      border-radius: 2px;
      color: ${primaryColor};
      &:hover {
        font-weight: bold;
      }
    }
  }
  
  .promotion-form-item {
    .ant-row {
      display: block;
    }
  }
`;

export const StyledSmsPromotionVoucher = styled.div`
  .new-sms-button {
    height: 40px;
    padding: 0 18px;
    border-radius: 2px;
    .anticon-plus {
      width: 16px;
      height: 16px;
      svg {
        width: 16px;
        height: 16px;
      }
    }
    .button-text {
      margin-left: 4px;
    }
  }
  
  .sms-promotion-voucher {
    .custom-table .ant-table-expanded-row > .ant-table-cell {
      background-color: #F5F5F5;
      padding: 20px;
    }
    
    .ant-table-row-expand-icon-cell {
      .expand-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }

    .link {
      color: #2F54EB;
      text-decoration: underline;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: color 0.3s;
      &:hover {
        color: #1890ff;
      }
    }
    
    .sms-status {
      border-radius: 2px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 1px 8px;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      width: 120px;
      margin: 0 auto;
    }
    .sms-active-status {
      border: 1px solid #B0B0F2;
      background: #F0F0FE;
      color: #2A2A86;
    }
    .sms-inactive-status {
      border: 1px solid #FFE58F;
      background: #FFFBE6;
      color: #FAAD14;
    }
  }
  
  .general-form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .general-info {
      width: 65%;
      margin-right: 20px;
      .ant-card-head-title {
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: #262626;
        text-transform: none;
      }
      .general-info-button {
        display: flex;
        justify-content: flex-end;
        height: 36px;
        .ant-btn {
          height: 36px;
          border-radius: 2px;
        }
      }
    }
    .key-word-list {
      flex-grow: 1;
      height: fit-content;
      .key-word-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .insert-button {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 9px 18px;
          height: 28px;
          background: #FFFFFF;
          border: 1px solid #BFBFBF;
          border-radius: 2px;
          color: #2A2A86;
          &:hover {
            font-weight: bold;
            background: #F0F0FE;
          }
        }
      }
    }
    .create-modal-general-info {
      width: 60%;
      .promotion-code-rule-title {
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: #000000;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
    }
  }
`;
