import styled from "styled-components";

export const StyledHeader = styled.div`
  margin: 20px 0;
  display: flex;

  .ant-btn {
    margin-right: 30px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border: 1px solid #e5e5e5;
    img {
      margin-right: 10px;
    }
  }
  .active-button {
    background-color: #f3f3ff;
    color: #222222;
  }

  .icon-active-button {
    margin-left: 5px;
    margin-right: 0 !important;
  }
`;

export const StyledComponent = styled.div`
 .custom-table .ant-table.ant-table-middle .ant-table-tbody > tr > td {
    padding: 8px 15px;

    .link {
      color: #2a2a86;
      text-decoration: none;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: color .3s;
      &:hover {
        color: #1890ff;
        text-decoration: underline;
      }
    }
  }
`;
