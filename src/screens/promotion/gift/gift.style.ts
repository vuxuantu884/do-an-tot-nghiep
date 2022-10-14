import styled from "styled-components";

export const GiftStyled = styled.div`
  .general-info {
    .ant-input-number {
      width: 100%;
    }
  }

  .delete-icon {
    &:hover {
      background-color: #f7f7ff;
    }
    &:focus {
      background-color: #f7f7ff;
    }
  }

  .ant-select-selector {
    border-radius: 0 !important;
  }

  .ant-select {
    &.ant-select-selector-min-height {
      .ant-select-selector,
      .ant-select-selector .ant-select-selection-search-input {
        height: auto;
        min-height: 36px;
      }
    }
  }

  .card {
    .status-tag {
      margin-left: 10px;
      background-color: #27ae60;
      color: #ffffff;
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
      border-radius: 100px;
      padding: 5px 10px;
    }
  }
  .page-filter {
    padding-top: 0;
  }

  .product-card {
    .ant-card-body {
      padding-top: 0;
    }
  }
`;

export const ImportFileDiscountStyled = styled.div`
  .dragger-wrapper {
    width: 100%;
    padding: 10px 30px;
  }
  .error-import-file {
    &__circel-check {
      font-size: 78px;
      color: rgb(39, 174, 96);
    }
    &__info {
      padding: 10px 30px;
    }
    &__number-success {
      color: #2a2a86;
    }
    &__title {
      color: #e24343;
    }
    &__list {
      padding: 10px 30px;
      max-height: 350px;
      overflow-y: auto;
      width: 100%;
    }
    &__item {
      padding-bottom: 1em;
      font-size: 14px;
    }
  }
`;

export const DiscountDetailListStyled = styled.div`
  .input-search-product {
    display: flex;
    .label-search-product {
      font-weight: 500;
      white-space: nowrap;
      margin-right: 10px;
    }
  }

  .ant-input-search .ant-input-group .ant-input-affix-wrapper {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

export const GiftListFilterStyled = styled.div`
  .gift-list-filter {
    .ant-form-inline {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      .search {
        flex-grow: 1;
      }
      .search-variant {
        width: 50%;
      }
      .select-state {
        min-width: 150px;
        width: 20%;
      }
    }
    .ant-form-item:last-child {
      margin: 0;
    }
  }

  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
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

export const GiftCustomerConditionStyled = styled.div`
  .form-item-title {
    font-weight: 500;
    color: #222222;
    font-style: normal;
    margin-bottom: 8px;
  }

  .form-item-scope {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
`;