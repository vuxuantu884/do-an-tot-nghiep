import styled from "styled-components";

export const FilterWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 20px 0;
  justify-content: space-between;
  column-gap: 12px;
  .search {
    width: 100%;
    min-width: 250px;
  }
  .ant-form-item {
    flex: auto;
    margin-right: 0;
  }
`;
