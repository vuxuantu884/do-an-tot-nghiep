import styled from "styled-components";
import color from "assets/css/export-variable.module.scss";

const {primary, white } = color;

export const SearchContainer = styled.div`
  .ant-card-body {
    padding-top: 0;
  }
`;

export const FilterAccountAdvancedStyles = styled.div`
  .filter-date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    &__from {
      margin-right: 0px;
    }
    &__to {
      margin-left: 0px;
    }
  }

.group-checkbox-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 20px;
  &__checkbox{
    width: 100%;
    margin: 0;
    span:nth-child(1){
      display: none;
    }
    span:nth-child(2){
      width: 100%;
      padding: 0;
    }
  }
  .ant-btn {
    width: 100%;
  }
}

.ant-checkbox-wrapper-checked{
.ant-btn,  .ant-btn:hover {
    color: ${white};
    background-color: ${primary};
    border-color: ${primary} ;
  }
}
`;
