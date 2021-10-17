import styled from "styled-components";

export const StyledWrapper = styled.div`
  //position: relative;
  .ant-card-head {
    margin-bottom: 10px;
  }

  .ant-card-body {
    padding-top: 0;
  }
  .product-detail {
    margin-top: 20px;
  }
  .inventory-table {
    margin-top: 20px;
  }

  .sum-qty {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-top: 20px;
    & b {
      margin-right: 140px;
    }
    & span {
      margin-right: 100px;
    }
  }

  .product-item-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 40px;
    border-radius: 3px;
    background-color: #f2f2f2;
    img {
      max-width: 30px;
      max-height: 40px;
      border-radius: 3px;
    }
  }

  .sticky-bar-bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: white;
    margin-left: -30px;
    div {
      position: relative;
      button {
        position: absolute;
        right: 0%;
        //transform: translate(0, -50%);
      }
    }
  }

  .ant-table-body {
    .ant-input.warning {
      border-color: red;
    }
  }
`;
