import styled from "styled-components";

export const StyledComponent = styled.div`
    .procurement-code {
        color: #5656A2;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: #1890ff;
        }

        &--disable {
            cursor: no-drop; 
        }
    }
    .page-filter{
        padding: 0px;
    }
    .warning-confirm{
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
      color: #2A2A86;
    }
    &-green {
      background: rgba(39, 174, 96, 0.1);
      color: #27AE60;
    }
    &-gray {
      background: #F5F5F5;
      color: #666666;
    }
  }
`;
