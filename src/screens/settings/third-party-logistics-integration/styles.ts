import styled from "styled-components";

export const StyledComponent = styled.div`
  display: block;
  .ant-card-body {
    border-left: 1px solid #e5e5e5;
    border-top: 1px solid #e5e5e5;
  }
  .singleThirdParty {
    padding: 30px 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-right: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    &__title {
      font-size: 1em;
      font-weight: bold;
    }
  }
`;
