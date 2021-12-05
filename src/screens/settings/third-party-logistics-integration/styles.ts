import styled from "styled-components";

export const StyledComponent = styled.div`
  display: block;
  .ant-card-body {
    border-left: 1px solid #e5e5e5;
    border-top: 1px solid #e5e5e5;
    padding: 0;
  }
  .singleThirdParty {
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
    display: flex;
    height: 100%;
    justify-content: space-between;
    padding: 30px 20px;
    &__title {
      font-size: 1em;
      font-weight: bold;
      a {
        color: #000000;
      }
    }
    &__logo {
      margin-bottom: 15px;
    }
    &__connect {
      img {
        margin-right: 5px;
      }
    }
  }
`;