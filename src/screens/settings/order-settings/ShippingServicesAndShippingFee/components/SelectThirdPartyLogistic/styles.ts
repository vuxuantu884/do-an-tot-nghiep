import styled from "styled-components";

export const StyledComponent = styled.div`
  .title {
    display: inline-block;
    font-weight: 500;
    margin-bottom: 0;
    vertical-align: middle;
  }
  th.columnService {
    text-align: center;
    text-indent: -30%;
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
      display: block;
    }
    label {
      float: left;
      margin: 5px 0;
      width: 50%;
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
