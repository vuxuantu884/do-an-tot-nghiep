import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-extra {
    font-weight: 500;
  }
  .textExtra {
    display: inline-block;
    margin-left: 5px;
    vertical-align: middle;
    span {
      &.inactive {
        opacity: 0;
        visibility: hidden;
      }
      &.shortText {
        position: absolute;
        z-index: 1;
      }
    }
  }
`;
