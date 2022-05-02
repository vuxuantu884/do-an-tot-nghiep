import styled from "styled-components";

export const StyledComponent = styled.div`
  display: inline-flex;
  margin-right: 15px;
  cursor: pointer;
  .ant-tag {
    margin-right: 0;
    &.active {
      .ant-tag-close-icon {
        color: #fff;
      }
    }
  }
`;
