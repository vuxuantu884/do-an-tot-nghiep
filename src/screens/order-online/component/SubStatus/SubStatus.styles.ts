import styled from "styled-components";
import { borderColor, dangerColor, greenColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-collapse-header {
    display: flex ;
    align-items: center;
  }
  .orders-timeline-custom {
      position: relative;
      // margin-left: 20px;
      // &::before {
      //   position: absolute;
      //   content: "";
      //   width: 14px;
      //   height: 14px;
      //   top: 20px;
      //   left: -4px;
      //   border-radius: 50%;
      // }
      &.currentTimeline {
        &:after {
          background-color: ${greenColor} !important;
        }
        b,
        i,
        span {
          color: ${greenColor} !important;
        }
        &.hasError {
          &:after {
            background-color: ${dangerColor} !important;
          }
          b,
          i,
          span {
            color: ${dangerColor} !important;
          }
        }
      }
    }
    .orders-timeline-custom.order-shipment-dot-default {
      &::before {
        background-color: #e5e5e5;
      }
    }

    .orders-timeline-custom.order-shipment-dot-active {
      &::before {
        background-color: ${greenColor};
      }
    }
    .orders-timeline-custom.order-shipment-dot-cancelled {
      .saleorder-header-content {
        .text-field {
          color: #e24343 !important;
        }
      }
    }
    .icon-dot {
      font-size: 4px;
      margin: 10px 10px 10px 10px;
      color: #737373;
      position: relative;
      top: -2;
    }
`;
