import styled from "styled-components";

export const EmptyDataTableStyled = styled.div`
  .empty-data {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 20px;
  }
`;

export const CampaignListFilterStyled = styled.div`
  .campaign-list-filter {
    .search-input {
      margin-right: 24px;
      min-width: 300px;
      flex-grow: 1;
      height: 36px;
    }

    .select-state {
      min-width: 250px;
    }

    .filter-description {
      font-size: 14px;
      line-height: 22px;
      color: #262626;
      padding: 8px 0;
      height: 36px;
    }

    .select-date {
      margin: 0 12px;
      width: 160px;
      .ant-picker {
        width: 100%;
      }
    }

    .arrow-icon {
      width: 16px;
      height: 36px;
      line-height: 38px;
      transform: translateY(-2px);
    }
  }

  .filter-tags {
    margin-top: 20px;
    .ant-tag {
      margin-top: 0;
      margin-bottom: 8px;
    }
    .tag {
      padding: 10px 20px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }
`;

export const RemovePromotionColumnStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  .remove-item-icon {
    cursor: pointer;
    width: 20px;
    background: #f5f5f5;
    &:hover {
      border: 1px solid #5c5c5c;
    }
  }
`;

export const ConfirmCancelModalStyled = styled.div`
  .header-modal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    color: #262626;
  }
  .content-modal {
    margin-top: 8px;
    margin-left: 40px;
  }
`;

export const PromotionSelectedListStyled = styled.div`
  .custom-table {
    //height: 500px;
    overflow: auto;
    max-height: 500px;
  }
`;

export const PromotionCampaignFormStyled = styled.div`
  .form-name {
    display: flex;
    .name-description {
      margin-right: 20px;
    }
    .name-input {
      flex-grow: 1;
    }
  }
  .content {
    margin-bottom: 8px;
  }
`;

export const PromotionCampaignStepStyled = styled.div`
  .ant-steps-navigation {
    padding-top: 0;
  }
  .promotion-campaign-step {
    .ant-steps-item-finish,
    .ant-steps-item-active {
      &::before {
        left: 0;
        width: 100%;
        height: 4px;
      }
    }
    .ant-steps-item-wait {
      &::before {
        left: 0;
        width: 100%;
        height: 4px;
        background-color: #bfbfbf;
      }
    }
    .ant-steps-item-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;

      .ant-steps-item-icon {
        width: 24px !important;
        height: 24px !important;
        margin-left: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        .ant-steps-icon {
          font-size: 14px;
        }
      }

      .ant-steps-item-title {
        font-size: 14px;
      }
    }
  }
`;

export const PromotionCampaignDetailsStyled = styled.div`
  .title {
    color: #595959;
  }
  .ant-col {
    margin-bottom: 16px;
  }
  .ant-card {
    border-radius: 5px;
  }
  .condition-item {
    margin-bottom: 24px;
    .title {
      margin-bottom: 8px;
    }
  }
  .description-content {
    max-height: 250px;
    overflow: auto;
  }
`;

export const CustomerConditionDetailStyled = styled.div`
  //.customer-condition {
  //  display: flex;
  //  flex-direction: column;
  //}
`;

export const PromotionCampaignLogsDetailStyled = styled.div`
  .log-container {
    max-height: 300px;
    overflow: auto;
    li {
      margin-bottom: 12px;
    }
    .log-item {
      display: flex;
      justify-content: space-between;
      .user-name {
        flex-grow: 1;
      }
      .event-date {
        width: 115px;
        margin-left: 8px;
      }
    }
    .event-name {
      word-wrap: break-word;
    }
  }
`;
