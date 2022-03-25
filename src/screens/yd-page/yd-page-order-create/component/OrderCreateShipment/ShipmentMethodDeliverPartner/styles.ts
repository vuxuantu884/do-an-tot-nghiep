import styled from "styled-components";

export const StyledComponent = styled.div`
  .logoHVC {
    height: 41px;
    width: 184px;
  }
  .ant-form-item{
    margin-bottom: 6px !important;
  }
  
  .delivery-method-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .method {
      flex-grow: 1;
      padding: 5px;
      min-width: 100px;
      border-right: 1px solid #ddd;
      border-left: 1px solid #ddd;
    }
    .method-th {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cost {
      text-align: right;
      min-width: 80px;
      padding: 5px;
    }
    .custom-table__has-border-bottom:not(:last-child) {
      border-bottom: unset;
    }
  }
  .delivery-method-item:not(:last-child) {
    border-bottom: 1px solid #ddd;
  }
`;
