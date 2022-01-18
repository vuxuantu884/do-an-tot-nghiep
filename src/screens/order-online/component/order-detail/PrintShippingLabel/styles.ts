import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  display: block !important;
  margin-left: 10px;
  width: auto;
  button {
    background: none;
    color: #222;
    border-color: ${borderColor};
    img {
      margin-right: 10px;
    }
  }
`;
