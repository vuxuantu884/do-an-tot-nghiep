import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .product {
    padding: 0;
  }
  .button-pick-many {
      display: flex;
      justify-content: center;
      align-items: center;
      column-gap: 5px;
      background-color: white;
      color: #222222;
      border: 1px solid ${borderColor};
  }
  .avatar {
    width: 45px;
    height: 45px;
    border-radius: 3px;
    object-fit: cover;
  }
`;
