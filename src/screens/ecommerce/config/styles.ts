import styled from "styled-components";

export const StyledComponent = styled.div`
  .connect-ecommerce-dropdown {
    &:hover {
      border-color: #2A2A86;
      color: #2A2A86;
    }
  }
`;

export const StyledConfirmUpdateShopModal = styled.div`
  .confirm-update-shop {
    display: flex;
    align-items: center;
    .image {
      width: 70px;
      height: 70px;
      background-color: rgb(135, 135, 144);
      border-radius: 50%;
      padding: 17px;
      margin-right: 25px;
    }
    .title {
      font-size: 16px;
      font-weight: 700;
    }
  }
`;
