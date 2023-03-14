import styled from "styled-components";

export const StyledAutoReply = styled.div`
  .card-shop-info {
    .ant-card-body {
      padding: 8px 20px;
    }
    .shop-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .shop-image {
        width: 64px;
        height: 70px;
        margin-right: 8px;
        position: relative;
        .ecommerce-logo {
          width: 25px;
          height: 25px;
          background-color: white;
          position: absolute;
          right: 0;
          top: 5px;
          border-radius: 50%;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 20px;
            height: 20px;
            border-radius: 50%;
          }
        }
        .image {
          width: 60px;
          height: 60px;
          position: absolute;
          left: 0;
          bottom: 0;
          border-radius: 50%;
        }
      }
      .shop-name {
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        color: #000000;
      }
    }
  }
  
  th {
    .AutoReplyHeader {
      .productNameWidth {
        text-align: center;
      }
    }
  }
  .ant-table-thead {
    .ant-table-cell.shopName {
      border-right: 1px solid #ddd;
    }
    .productNameWidth {
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      &:after {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        right: 201px;
        background-color: #ddd;
      }
    }
    .productsPushing {
      padding: 0 0 0 11px !important;
    }
  }
  }
  .ant-table-body {
    .ant-table-cell.productsPushing {
      padding: 0 !important;
    }
  }
  td {
    position: relative;
  }
  .AutoReplyHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameWidth {
  }
  .timeWidth {
    width: 200px;
    text-align: center;
  }
  .item.custom-td {
    height: 100%;
    display: flex;
    justify-content: space-between;
    &:not(:last-child) {
      border-bottom: 1px solid #ddd;
    }
    .product {
      padding: 10px 10px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    p {
      margin-bottom: 0;
    }
    .time {
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        right: 200px;
        background-color: #ddd;
      }
    }
    .pd-12 {
      padding-left: 12px;
    }
    .pushing {
      color: #5656a2;
    }
  }
  td {
    position: relative;
    overflow: hidden;
    border-right: 1px solid #ddd;
  }
`;
