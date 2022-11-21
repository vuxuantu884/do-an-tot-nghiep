import styled from "styled-components";

export const ProcurementDetailWrapper = styled.div`
  .pr-detail {
    .ant-card-body {
      padding-top: 0;
    }
  }
  .pr-detail-pr-code {
    display: flex;
  }
  .pr-detail-pr-code-icon {
    background-color: #f4f4fc;
    height: 44px;
    width: 44px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
  }
  .pr-detail-pr-code-icon > img {
    display: block;
  }
`;
