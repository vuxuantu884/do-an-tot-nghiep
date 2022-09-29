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
