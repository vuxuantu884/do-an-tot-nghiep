import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-body {
    padding-top: 0;
  }
  a {
    &:hover {
      text-decoration: underline;
    }
    &.buttonLink {
      text-decoration: none;
    }
  }
  .buttonLinks {
    a {
      &:hover {
        text-decoration: none;
      }
    }
  }
`;
