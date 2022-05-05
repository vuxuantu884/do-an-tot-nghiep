import color from "assets/css/export-variable.module.scss";
import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
const { grayE5, white } = color;
export const ChartColor = {
  primary: "#2A2A86",
  secondary: "#FCAF17",
  cinnabar: "#E24343",
  black: "black",
  white: "white",
};
export const DashboardContainer = styled.div`
  margin-top: 20px; 
  .divider-table{
    border-top: 2px solid ${grayE5};
    margin-top: 30px; 
    margin-bottom: 10px;
     }
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
    @media screen and (max-width: 576px) {
      flex-direction: column;
      align-items: start;
      gap: 16px;
    }
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
    @media screen and (max-width: 576px) {
      padding: 16px 0;
    }
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
      /* padding-left: 0; */
    }
  }
  .verti-grid {
    margin: -20px 0;

    &__item {
      width: 100%;
      height: 110px;
      border-bottom: 1px solid ${borderColor};
      .income-box{
        padding-left: 0;
      }
    }
  }

  .horiz-grid {
    width: 100%;
    &__item {
      height: 110px;
      border-left: 1px solid ${borderColor};
      border-bottom: 1px solid ${borderColor};
      @media screen and (max-width: 576px) {
        border-left: none;
      }
    }
  }

  .chart-monthly-container {
    width: 100%;
    height: 330px;
    padding: 20px;
    border-left: 1px solid ${borderColor};
    border-bottom: 1px solid ${borderColor};
    @media screen and (max-width: 576px) {
      height: auto;
      border-left: none;
    }
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

  .rank-container {
    margin: -20px 0;
    .user-rank {
      padding: 20px 30px 20px 0;
    }
    .store-rank {
      padding: 20px 30px;
       border-right: 1px solid #E5E5E5;
       border-left :1px solid #E5E5E5
      } 
      .department-rank {
        padding: 20px 0 20px 30px;
      }
  }
 .product-dashboard{
   &>.ant-card-body{
     padding-top: 0;
     padding-left: 0;
   }
 }
  .product-group{
    &-cart{
      border:none;
       border-right: 1px solid ${grayE5};
        box-shadow: none;
       
      .ant-card-bordered{
        border : none;
      }
      .ant-card-body{
        padding-right: 0;
    }
    .ant-tabs-content-holder{
      margin-top: 20px;
    }
    .ant-tabs-nav{
      padding: 0;
    }
    .ant-tabs-tab{
      padding: 0 0 12px 12px !important;
    }
    .ant-table-tbody{
      tr{
        td{
          border-bottom: 1px solid ${white};
        }
      }
      .ant-table-cell{
        padding : 0 !important;
      }
      .name-row{
        padding : 12px;
        background-color: #F5F5FF;     
    }

  
    .value-row{
      padding : 12px;
      position: relative;
      opacity: 0.9; 
    }
    .process-bg{
      background-color: #D7D7FF;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: -1;  
    }
    }
    
  } 
`;

export const ShowMyDataStyle = styled.div`
  padding: 0 10px;
  margin-bottom: 5px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 400px;
.ant-radio-group {
  display: grid;
  grid-template-columns: repeat( 2,minmax(200px,1fr) );  
  column-gap: 20px;
  row-gap: 5px;
}
`
