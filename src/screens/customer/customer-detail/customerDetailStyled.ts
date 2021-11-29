import styled from "styled-components";
import { StyledCustomerInfo } from "screens/customer/customerStyled";

// Inherit StyledCustomerInfo in StyledCustomerDetail
export const StyledCustomerDetail = styled(StyledCustomerInfo)`
  .action-button {
    padding: 6px 15px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    color: $primary-color;
    &:hover {
      border: 1px solid $primary-color;
      color: $primary-color;
    }
  }

  .customer-status {
    margin: 0 10px;
    padding: 2px 15px;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    border-radius: 15px;
    &.active {
      background-color: #27AE60;
    }
    &.inactive {
      background-color: #676767;
    }
  }

  .customer-info {
    .point-info {

    }
  }

  .detail-info {
    display: flex;
    margin-bottom: 12px;
    color: #222222;

    .title {
      display: flex;
      justify-content: space-between;
      width: 40%;
    }
    .content {
      margin-left: 10px;
      width: 60%;
      overflow-wrap: break-word;
      font-weight: 500;
    }
    .link {
      color: #2a2a86;
      text-decoration: none;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: color .3s;
      &:hover {
        color: #1890ff;
        text-decoration: underline;
      }
    }
  }
  
  .show-more {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .action {
      cursor: pointer;
        margin-left: 10px;
    }
    .dash {
      width: 85%;
      border-bottom: 1px dashed #E5E5E5;
    }
  }

  .point-info {
    width: 25%;
    .title {
      width: 50%;
    }
    .content {
      width: 50%;
    }
  }

  .purchase-info {
    .item-info {
      display: flex;
      margin-bottom: 12px;
      padding-right: 20px;
      color: #222222;
    }
  }

  .extended-info {
    .ant-card-body {
      padding: 0 20px;
    }
    .tabs-list {
      overflow: initial;
      .ant-tabs-nav {
        margin-bottom: 20px;
        padding: 0;
      }
    }
  }

`;
