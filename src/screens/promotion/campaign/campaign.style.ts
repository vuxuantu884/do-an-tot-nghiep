import styled from "styled-components";

export const EmptyDataTableStyled = styled.div`
  .empty-data {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
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
    background: #F5F5F5;
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
    height: 500px;
    overflow: auto;
  }
`;
