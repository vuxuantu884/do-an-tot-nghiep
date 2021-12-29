import styled from "styled-components";
export const ChartColor = {
  primary: "#2A2A86",
  secondary:"#FCAF17",
  cinnabar: "#E24343",
  black: "black",
  white: "white",
};
export const DashboardContainer = styled.div`
  .monthly-chart {
    &__info {
      margin-bottom: 45px;
      .title {
        color: ${ChartColor.cinnabar};
        margin: 0;
      }
      .guild {
        width: fit-content;
        float: right;
      }
    }

    &__currency {
      display: flex;
      align-items: center;

      .price {
        margin: 0;
        font-weight: bold;
        font-size: 18px;
      }
      .day {
        font-size: 12px;
      }
    }
    &__tooltip {
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      color: #212529;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px;
      text-align: left;
      white-space: nowrap;
      .tooltip-title {
      text-align: center;
      }
    }
  }
`;
