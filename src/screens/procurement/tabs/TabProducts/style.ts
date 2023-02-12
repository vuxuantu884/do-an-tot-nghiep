import styled from "styled-components";

export const StyledComponent = styled.div`
  .procurement-code {

    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }

    &--disable {
      cursor: no-drop;
    }
  }
  .page-filter {
    padding: 0px;
  }
  .warning-confirm {
    word-break: break-word;
  }
  .link-underline {
    color: inherit;
    &:hover {
      text-decoration: underline;
    }
  }
  .status {
    border-radius: 100px;
    padding: 5px 10px;
    &-blue {
      background: rgba(42, 42, 134, 0.1);
      color: #2a2a86;
    }
    &-green {
      background: rgba(39, 174, 96, 0.1);
      color: #27ae60;
    }
    &-gray {
      background: #f5f5f5;
      color: #666666;
    }
  }
`;
