
import styled from "styled-components";

export const ActionStyle = styled.div`
  .page-filter {
    padding: 0;
  }
  .action-button {
    z-index: 1;
    position: absolute;
    transform: translate(0, -50%);
  } 
`;

export const StyledComponent = styled.div`
  .custom-table .ant-table.ant-table-middle .ant-table-tbody > tr > td{
        padding: 4px 4px !important;
  } 

  .custom-table .ant-table.ant-table-middle .ant-table-tbody .ant-table-wrapper:only-child .ant-table{
      margin: -4px -4px -4px 30px;
  }

  .custom-table .ant-table-measure-row{
    display: none;
  }
  `;