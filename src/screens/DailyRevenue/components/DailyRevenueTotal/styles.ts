import styled from "styled-components";
import {
  borderColor,
  borderRadius,
  dangerColor,
  primaryColor,
  successColor,
  textBodyColor,
  textMutedColor,
  yellowColor,
} from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .separator {
    position: absolute;
    z-index: 1;
    top: 50%;
    font-size: 1.286rem;
    transform: translateY(-50%);
    font-weight: bold;
    color: ${textMutedColor};
  }
  .totalWrapper {
    position: relative;
    height: 100%;
    .separator {
      right: 0;
    }
    .amount {
      color: ${textBodyColor};
    }
  }
  .singleElement {
    display: flex;
    align-items: center;
    justify-content: center;
    &__wrapper {
      position: relative;
      .separator {
        left: 0;
      }
    }
    &__img {
      margin-right: 12px;
    }
  }
  .title {
    line-height: 1.25;
    margin-bottom: 0;
    font-weight: normal;
    color: ${textMutedColor};
  }
  .amount {
    color: ${textMutedColor};
    font-size: 1.143rem;
  }
  .dailyRevenueTotal {
    &__calculator {
      margin-bottom: 35px;
    }
  }

  .ant-table .ant-table-tbody > tr > td {
    border-right: 1px solid ${borderColor};
  }
  .leftAmount {
    color: ${dangerColor} !important;
  }
  .sectionPayResult {
    &__title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      h3 {
        margin-bottom: 0;
        font-size: 1rem;
        color: ${primaryColor};
        font-weight: bold;
      }
      .ant-tag {
        margin-top: 0;
        margin-left: 20px;
        background: none;
        border: 1px solid ${textBodyColor};
        color: ${textBodyColor};
        &.warning {
          border-color: ${yellowColor};
          color: ${yellowColor};
        }
        &.success {
          border-color: ${successColor};
          color: ${successColor};
        }
      }
    }
    &__detail {
      padding-left: 20px;
    }
    &__single {
      display: flex;
      align-items: center;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
    &__label {
      color: ${textMutedColor};
      font-weight: normal;
      font-size: 1rem;
      margin-bottom: 0;
      width: 135px;
    }
    &__value {
      margin-left: 10px;
      font-weight: bold;
      &.successColor {
        color: ${successColor};
      }
      &.dangerColor {
        color: ${dangerColor};
      }
      .ant-input {
        height: 25px;
        line-height: 23px;
        width: 120px;
      }
    }
    &__image {
      max-width: 300px;
      max-height: 400px;
    }
  }
  .sectionPayMoney {
    &__buttons {
      margin-top: 15px;
      text-align: right;
      button {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
  img {
    max-width: 100%;
  }
  .ant-upload-list-item-info {
    display: inline-block;
  }
  .ant-upload-list-item-card-actions-btn {
    background: none;
    border: none;
  }
  .ant-upload-span {
    color: ${dangerColor};
    path {
      fill: ${dangerColor};
    }
  }

  .ant-upload-list-picture-card-container {
    margin: 0 12px 12px 0;
  }
  .ant-image {
    padding: 5px;
    border-radius: ${borderRadius};
    border: 1px solid ${borderColor};
    width: 104px;
    height: 104px;
    .ant-image-img {
      width: 94px;
      height: 94px;
      object-fit: cover;
    }
  }
  .gallery {
    .single {
      display: inline-block;
      margin-right: 15px;
      vertical-align: top;
      margin-bottom: 10px;
    }
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .custom-table {
    margin-bottom: 15px;
  }
  .totalRow {
    font-weight: 600;
    color: ${textBodyColor};
    padding: 5px 8px;
    background: #f0f5ff;
    .title {
      color: ${textBodyColor};
      font-weight: 600;
      text-transform: uppercase;
    }
  }
  .sectionUploadPayment {
    margin-top: 15px;
  }
`;
