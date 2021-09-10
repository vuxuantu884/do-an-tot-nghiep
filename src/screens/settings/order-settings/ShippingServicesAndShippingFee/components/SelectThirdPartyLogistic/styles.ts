import styled from "styled-components";

export const StyledComponent = styled.div`
  .title {
    display: inline-block;
    font-weight: 500;
    margin-bottom: 0;
    vertical-align: middle;
  }
  th.columnService {
    padding-left: 14%;
    text-align: left !important;
  }
  .ant-table-cell {
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .inner {
    align-items: center;
    display: inline-flex;
    height: 50px;
  }
  .columnService {
    .listServices {
      display: flex;
    }
    label {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
  .logoHVC {
    img {
      margin-right: 15px;
      width: 150px;
      max-height: 50px;
    }
  }
`;
