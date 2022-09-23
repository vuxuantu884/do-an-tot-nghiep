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
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .ant-tabs-tab-active {
    a {
      color: #2a2a86 !important;
    }
  }
  .dropdown .ant-btn, .dropdown .ant-btn:hover {
    background-color: #FFFFFF;
    border: 1px solid #dedede;
  }
  .card-transfer {
    position: relative;
    .transferring-sender {
      font-weight: 500;
      position: absolute;
      top: 2px;
      left: 212px;
      z-index: 10;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      color: #FFFFFF;
      font-size: 9px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: orange;
    }
    .transferring-receive {
      font-weight: 500;
      position: absolute;
      top: 2px;
      left: 316px;
      z-index: 10;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      color: #FFFFFF;
      font-size: 9px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: orange;
    }
  }
`;
