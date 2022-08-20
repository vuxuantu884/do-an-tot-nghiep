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
  .cannotDeleteOrderModal {
    display: flex;
    overflow: hidden;
    white-space: nowrap;
    padding-top: 7px;
    &__orderCode {
      margin-left: 10px;
      font-weight: 500;
      p {
        margin-bottom: 0;
      }
    }
  }
`;
