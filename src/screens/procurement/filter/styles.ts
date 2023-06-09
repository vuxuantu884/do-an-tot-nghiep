import styled from "styled-components";

export const FilterProcurementStyleWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  .search {
    width: 60%;
  }
  .merchandisers {
    width: 20%;
    min-width: 200px;
  }
  .suppliers {
    width: 40%;
    margin-right: 0;
  }
  .btn-action {
    display: flex;
    margin-left: auto;
    .ant-form-item:last-child {
      margin-right: 0;
    }
  }
  .ant-form-item {
    flex: auto;
  }
`;

export const ProcurementStatusStyle = styled.div`
  display: flex;
  column-gap: 20px;
  .active,
  .ant-btn:hover {
    color: #ffffff;
    background-color: #2a2a86;
    border-color: #2a2a86;
  }
`;
