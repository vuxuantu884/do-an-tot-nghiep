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
          .daily-revenue-filter {
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
  .ant-form-item-custom {
    margin: 0 0 18px;
  }
  .remaining-amount {
    gap: 8px;
    display: flex;
    button {
      width: 100%;
    }

    .active {
      color: #ffffff;
      border-color: rgba(42, 42, 134, 0.1);
      background-color: #2a2a86;
    }
    .deactive {
      color: #2a2a86;
      border-color: rgba(42, 42, 134, 0.05);
      background-color: rgba(42, 42, 134, 0.05);
    }

    .swap-right-icon {
      width: 10%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      .anticon-swap-right {
        font-size: 23px;
        color: #757575;
      }
    }
  }

  .ant-drawer-content-wrapper {
    width: 400px;
  }
  .revenue-filter-tags a {
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
