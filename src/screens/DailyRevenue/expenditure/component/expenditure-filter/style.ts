import styled from "styled-components";

export const StyledComponent = styled.div`
  .page-filter {
    padding: 0px;
    padding-bottom: 20px;
    .page-filter-right {
      display: flex;
      width: 100%;
      justify-content: space-between;
      .ant-space {
        width: 100%;
        grid-gap: 0 !important;
        gap: 0 !important;
        .ant-space-item {
          width: 100%;
          grid-gap: 0 !important;
          gap: 0 !important;
          .expenditure-filter {
            .ant-form-item {
              flex: none;
              flex-wrap: nowrap;
              margin-right: 0px;
              margin-bottom: 0;
            }
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
  }
  .expenditure-filter-drawer {
    width: 1000px;
  }
  .ant-drawer-content-wrapper {
    width: 400px;
  }
  .expenditure-filter-tags a {
    color: rgb(42, 42, 134);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .btn-icon-center {
    position: absolute !important;
    top: 31%;
    right: 0;
    left: 0;
    bottom: 0;
  }
`;
