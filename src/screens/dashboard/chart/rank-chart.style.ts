import styled from "styled-components";
import {ChartColor} from "../index.style";

export const RankChartStyle = styled.div`
  .rank-chart {
    &__title {
      font-weight: bold;
      font-size: 1.2rem;
    }
    &__sub-title {
      font-size: 1rem;
      color: #666666;
    }
    &__legend {
      display: flex;
      margin-top: 20px;
      justify-content: center;
      max-width: 500px;
    }

    &__legend-item {
      display: inline-flex;
      align-items: end;
      p{
        margin: 0;
        line-height: .6;
      }
      &--primary {
        background-color: ${ChartColor.primary};
        width: 10px;
        height: 16px;
      }
      &--secondary {
        background-color: ${ChartColor.secondary};
        width: 10px;
        height: 10px;
        margin-left: 30px;
      }
    }
  }
`;
