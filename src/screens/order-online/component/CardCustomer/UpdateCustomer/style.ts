import styled from "styled-components";

export const StyleComponent = styled.div`
  .divider-custom {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    .ant-divider.ant-divider-horizontal {
      margin: 10px 0 !important;
      min-width: initial;
    }
    .divider-left {
      width: 110px;
    }
    .extend {
      color: rgb(86, 86, 161);
      margin-top: 0px;
    }
    &-collapse {
      padding: 0px;
      margin: 0px;
      color: rgb(86, 86, 161);
    }
  }

  .customer-footer {
    display: block;
    flex: 0 0 100%;
    button {
      padding: 0px 25px;
      font-weight: 400;
      float: right;
    }
  }
`;
