import styled from "styled-components";

export const StyledComponent = styled.div`
  .get-products-button {
    background-color: #ffffff;
    border: 1px solid #cccccc;
    &:hover {
        background-color: #AFEEEE;
        border: 1px solid #2a2a86;
    }
  }
`;

export const StyledEcommerceList = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;

  .ant-btn {
    padding: 7px 10px;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border: 1px solid #e5e5e5;
    img {
      margin-right: 10px;
    }
  }

  .active-button {
    background-color: #f3f3ff;
    color: #222222;
  }

  .icon-active-button {
    margin-left: 5px;
    margin-right: 0 !important;
  }

`;
