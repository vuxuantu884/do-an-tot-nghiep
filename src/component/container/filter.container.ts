import styled from "styled-components";

export const FilterWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 20px 0;
  justify-content: space-between;
  .search {
    width: 100%;
    min-width: 250 px;
  }
  .ant-form-item {
    flex: auto;
  }
  .ant-form-item:last-child {
    margin-right: 0;
  }
`;
