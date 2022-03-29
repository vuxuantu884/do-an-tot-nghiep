import styled from "styled-components";

export const StyledCustomer = styled.div`
  .page-header {
    height: auto;
  }
`;

export const StyledCustomerFilter = styled.div`
  .inline-filter {
    width: 100%;
    display: flex;
    margin-bottom: 20px;
    .input-search {
      flex-grow: 1;
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

export const StyledCustomerBaseFilter = styled.div`
  .base-filter-container {
    margin-top: 10px;
    .base-filter-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .left-filter {
        width: 33%;
      }

      .center-filter {
        width: 33%;
      }

      .right-filter {
        width: 30%;
      }
    }

    .title {
      font-weight: 500;
      color: #222222;
      font-family: Roboto;
      font-style: normal;
      margin-bottom: 6px;
    }

    .select-scope {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .select-item {
        width: 40%;
      }
    }

    .select-connection-date .date-option .ant-btn {
      width: 32%;
      padding: 0 6px;
    }
  }
`;

export const StyledCustomerExtraButton = styled.div`
  display: flex;

  .import-file-button {
    margin-right: 15px;
  }

  .export-file-button {
    margin-right: 15px;
  }
`;

export const StyledCustomerInfo = styled.div`
  .page-header {
    height: auto;
  }

  .card-title {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
    padding-left: 0;
  }

  .customer-info {
    display: flex;
    justify-content: flex-start;
    .general-info {
      width: 75%;
      margin-right: 20px;
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

    .other-info {
      width: 25%;
      height: fit-content;
      .other-info-body {
        .ant-form-item {
          margin-bottom: 16px;
          &:last-child {
            margin-bottom: 0;
          }
          textarea.ant-input {
            min-height: 80px;
          }
        }
      }
    }
  }

  .customer-contact {
    width: 74%;
    .ant-card-body {
      padding: 0;
      .ant-form-item {
        margin-bottom: 20px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .ant-collapse {
      border: 0;
      background-color: white;
    }
    .ant-collapse-header {
      padding: 12px 20px;
    }
    .ant-collapse-content-box {
      padding: 20px;
    }
    .phone-number-email {
      display: flex;
      justify-content: space-between;
      .left-item {
        width: 50%;
        margin-right: 15px;
      }
      .right-item {
        width: 50%;
        margin-left: 15px;
      }
    }
    .contact-note {
      .ant-input {
        min-height: 80px;
      }
    }
  }

  .customer-info-footer {
    display: flex;
    justify-content: space-between;
    height: 55px;
    width: 100%;
    box-shadow: 0px -1px 8px rgba(0, 0, 0, 0.1);
    align-items: center;
    padding: 0 32px;
    position: fixed;
    bottom: 0px;
    background-color: white;
    z-index: 99;
    padding-right: 280px;

    .go-back-button {
      border: none;
      padding: 0;
      color: #737373;
      :hover {
        text-decoration: none;
        background-color: white;
      }
    }
  }
`;
