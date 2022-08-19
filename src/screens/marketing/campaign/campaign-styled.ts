import styled from "styled-components";
import { borderColor, textMutedColor, primaryColor } from "utils/global-styles/variables";

export const CampaignStyled = styled.div`
  .page-header {
    height: auto;
  }
`;


export const CampaignCreateStyled = styled.div`
  .message-setting {
    .channel-list {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .channel-button {
        padding: 12px;
        display: flex;
        align-items: center;
        background-color: #ffffff;
        border: 1px solid ${borderColor};
        border-radius: 2px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        margin-right: 20px;

        img {
          margin-right: 10px;
          width: 28px;
        }
      }

      .active-button {
        background-color: #f3f3ff;
      }

      .icon-active-button {
        opacity: 0.5;
      }
    }

    .sms-setting {
      display: flex;
    }

    .message-preview {
      width: 360px;
      margin-left: 60px;

      .header {
        display: flex;
        justify-content: space-between;
        background-color: #0068FF;
        color: #FFFFFF;
      }

      .back-group {
        display: flex;
        align-items: center;
      }

      .header-icon {
        svg {
          width: 21px;
          height: 21px;
          color: #FFFFFF;
        }
      }

      .body {
        background: #FFFFFF;
        border-left: 1px solid #0068FF;
        border-right: 1px solid #0068FF;
        height: 500px;
        overflow-y: auto;

        .message-content {
          background: #EAEAEA;
          border-radius: 0 16px 16px 16px;
          padding: 10px;
          margin: 20px 66px 0 16px;
        }
      }

      .android-navigation {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        border-right: 1px solid #0068FF;
        border-bottom: 1px solid #0068FF;
        border-left: 1px solid #0068FF;
      }
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
  }

  .send-date {
    .ant-form-item-control, .ant-form-item-control-input {
      height: 38px;
    }

    .ant-form-item-control-input-content {
      display: flex;
      align-items: center;
    }
  }

`;


export const CampaignListFilterStyled = styled.div`
  .inline-filter {
    width: 100%;
    display: flex;
    margin-bottom: 20px;

    .input-search {
      flex-grow: 1;
    }

    .sender {
      width: 250px;
    }

    .status, .channel {
      width: 200px;
    }
  }

  .filter-tags {
    .ant-tag {
      margin-top: 0;
    }

    .tag {
      padding: 10px 20px;
      margin-bottom: 10px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }
`;

export const CampaignDetailStyled = styled.div`
  .item-label {
    color: ${textMutedColor};
  }

  .campaign-info {
    .ant-card-head-title {
      display: flex;
      align-items: center;
    }
    
    .item-detail {
      display: flex;

      .item-label {
        flex-shrink: inherit;
        margin-right: 8px;
      }
    }
  }

  .campaign-sms-detail {
    .item-info {
      display: flex;
      margin-bottom: 12px;
      padding-right: 20px;
    }

    .sms-label {
      font-weight: 600;
    }

    .sms-content {
      background-color: #EAEAEA;
      border-radius: 0 15px 15px 15px;
      padding: 10px;
      margin-top: 8px;
    }
  }

  .campaign-analysis {
    .item-info {
      display: flex;
      margin-bottom: 12px;
      padding-right: 20px;
      align-items: center;
    }

    .analysis-value {
      font-weight: 600;
    }
  }

  .campaign-customer-list {
    .item-info {
      display: flex;
      margin-bottom: 12px;
      padding-right: 20px;
    }

    .analysis-value {
      font-weight: 600;
    }
    
    .inline-filter {
      .status {
        width: 500px;
      }
    }
  }
`;
