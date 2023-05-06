import styled from "styled-components";

export const BinLocationStylesWrapper = styled.div`
  .ant-card-body {
    padding: 0 20px;
  }
  .ant-tabs-nav {
    padding: 0;
  }
  .ant-tabs-tab {
    a {
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .ant-tabs-tab-active {
    a {
      color: #2a2a86 !important;
    }
  }
  .dropdown .ant-btn,
  .dropdown .ant-btn:hover {
    background-color: #ffffff;
    border: 1px solid #dedede;
  }
  .dropdown .ant-btn .anticon {
    width: 16px;
    height: 16px;
  }
  .ant-btn-group > .ant-btn:last-child:not(:first-child),
  .ant-btn-group > span:last-child:not(:first-child) > .ant-btn {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
