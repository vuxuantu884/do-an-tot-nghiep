import styled from "styled-components";

export const StyleComponent = styled.div`
  #customer_info {
    .view_more_button {
      width: 25px;
      padding: 0px;
      line-height: 15px;
      height: 15px;
    }

    .view_more_icon {
      font-size: 12px;
      position: absolute;
      top: -5px;
      left: -5px;
    }
  }
  .icon-customer-info {
    width: 16px;
    height: 16px;
  }

  .customer-detail-icon {
    margin-right: 8px;
  }

  .poppver-to-fast {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: nowrap;
    .ant-btn {
      border-radius: 2px;
      height: 30px;
      line-height: 30px;
      padding: 0px;
      font-size: 1rem;
      font-weight: normal;
      color: inherit;
    }
    button > img {
      margin-right: 8px;
    }
  }
`;
