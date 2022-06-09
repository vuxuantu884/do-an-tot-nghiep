import styled from "styled-components";

export const ListTicketStylesWrapper = styled.div`
  .ant-card-body {
    padding: 0 20px;
  }
  .ant-tabs-nav {
    padding: 0;
  }
  .ant-tabs-tab {
    padding: 16px 0;

    a {
      color: rgba(0,0,0,.85);
    }
  }
  .ant-tabs-tab-active {
    a {
      color: #2a2a86 !important;
    }
  }
`;
