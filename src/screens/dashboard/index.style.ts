import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
export const ChartColor = {
  primary: "#2A2A86",
  secondary: "#FCAF17",
  cinnabar: "#E24343",
  black: "black",
  white: "white",
};
export const DashboardContainer = styled.div`
  margin-top: 20px;
  .greeting {
    display: flex;
    align-items: center;
    &__title {
      font-weight: bold;
      font-size: 20px;
    }
    &__img {
      width: 100px;
      height: 100px;
    }
    &__content {
      margin-left: 20px;
      .name {
        font-size: 18px;
        color: #2a2a86;
      }
      .quote {
        font-size: 14px;
        color: #222222;
      }
    }
  }
  .dashboard-filter {
    display: flex;
    align-items: center;
    column-gap: 20px;
    .title {
      margin: 0;
    }
    .select-filter {
      width: 250px;
    }
  }

  .income-box {
    display: flex;
    flex-direction: column;
    padding: 16px 20px;
    .title {
      font-size: 14px;
      color: #2a2a86;
    }
    .value {
      font-weight: bold;
      font-size: 18px;
    }
    .conclusion {
      color: #666666;
      white-space: nowrap;
    }
  }
  .business-results {
    .ant-card-body {
      padding-left: 0;
    }
  }
  .verti-grid {
    margin: -20px 0;

    &__item {
      width: 100%;
      height: 110px;
      border-bottom: 1px solid ${borderColor};
    }
  }

  .horiz-grid {
    width: 100%;
    height: 110px;
    &__item {
      border-left: 1px solid ${borderColor};
      border-bottom: 1px solid ${borderColor};
    }
  }

  .chart-monthly-container {
    width: 100%;
    height: 330px;
    padding: 20px;
    border-left: 1px solid ${borderColor};
    border-bottom: 1px solid ${borderColor};
  }
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
