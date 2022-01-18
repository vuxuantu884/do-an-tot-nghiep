import styled from "styled-components";

export const DiscountStyled = styled.div`
.general-info {
  .ant-input-number {
    width: 100%;
  }
}

.delete-icon {
  &:hover {
    background-color: #f7f7ff;
  }
  &:focus {
    background-color: #f7f7ff;
  }
}



.ant-select-selector {
  border-radius: 0px !important;
}

.ant-select {
  &.ant-select-selector-min-height {
    .ant-select-selector,
    .ant-select-selector .ant-select-selection-search-input {
      height: auto;
      min-height: 36px;
    }
  }
}

.card {
  .status-tag {
    margin-left: 10px;
    background-color: #27ae60;
    color: #ffffff;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 6px;
    border-radius: 100px;
    padding: 5px 10px;
  }
}
 .page-filter {   
  padding-top: 0;
 }



`;

export const ImportFileDiscountStyled = styled.div`
.dragger-wrapper {
  width: 100%;
  padding: 10px 30px;
}
.error-import-file {
  &__circel-check {
    font-size: 78px;
    color: rgb(39, 174, 96);
  }
  &__info {
    padding: 10px 30px;
  }
  &__number-success {
    color: #2a2a86;
  }
  &__title {
    color: #e24343;
  }
  &__list {
    padding: 10px 30px;
    max-height: 350px;
    overflow-y: auto;
    width: 100%;
  }
  &__item {
    padding-bottom: 1em;
    font-size: 14px;
  }
}
`