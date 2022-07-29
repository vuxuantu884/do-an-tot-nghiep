import styled from "styled-components";

export const StyledComponent = styled.div`
  padding-top: 20px;
  .procurement-code {
    color: #5656a2;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }

    &--disable {
      cursor: no-drop;
    }
  }
`;
