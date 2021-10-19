import styled from "styled-components";

export const FilterProcurementStyle = styled.div`
  display: flex;
  width: 100%;
  padding-bottom: 20px;
  justify-content: space-between;
  .search {
    width: 60%;
  }
  .merchandisers {
    width: 20%;
  }
  .btn-action {
    display: flex;
    margin-left: auto;
    .ant-form-item:last-child {
      margin-right: 0;
    }
  }
`;

export const ProcurementStatusStyle = styled.div`
  display: flex;
  justify-content: center;
  column-gap: 20px;
  .active {
    color: #ffffff;
    background-color: #2a2a86;
    border-color: #2a2a86;
  }
`;
