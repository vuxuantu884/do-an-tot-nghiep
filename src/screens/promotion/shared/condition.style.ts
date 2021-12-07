import styled from "styled-components";
export const CustomerContitionDetailStyle = styled.div`
  .customer-condition {
    display: flex;
    flex-direction: column;
    .item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .title {
      margin-right: 5px;
    }

    .info {
      font-weight: 500;
    }
  }
`;

export const CustomerContitionFormlStyle = styled.div`
  .required-field {
    color: red;
  }
  .ant-select-selector {
    height: unset !important;
  }
`;
