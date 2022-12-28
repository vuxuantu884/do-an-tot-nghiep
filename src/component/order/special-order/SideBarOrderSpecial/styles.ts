import styled from "styled-components";
import { borderColor, primaryColor, textBodyColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .orders_special_create {
    .orders_special_header {
      margin-bottom: 15px;

      /* display: flex;
      align-items: center;
      width: 100%;
      height: auto;
      margin: 20px 0 0 0;
      border-bottom: 1px solid ${primaryColor};
      padding: 0 20px; */
      .orders_special_item_header {
        border-radius: 3px;
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
        /* border: 1px solid ${borderColor};
        padding: 8px 20px;
        cursor: pointer;
        margin-bottom: -1px;
        transition: border 0.3s ease; */
        &:hover {
          background: ${primaryColor};
          color: white;
        }
        &.active {
          background: ${primaryColor};
          color: white;
          /* border-bottom: none; */
          /* border-radius: 3px 3px 0 0; */
          /* background-color: white; */
          /* padding-bottom: 20px; */
          span {
            /* color: ${primaryColor}; */
            /* font-weight: 500; */
          }
        }
      }
    }
  }

  .orders_special_content {
    width: 100%;
    /* padding: 20px 20px; */
  }

  .orders_special_detail {
    margin-bottom: 10px;
    /* padding: 5px 20px; */
  }
  .orders_special_detail > .orders_special_detail_content {
    font-weight: 500;
  }

  .ant-card-body {
    /* padding: 10px 0px; */
  }
  .title {
    color: ${textBodyColor};
  }
`;
