import styled from "styled-components";

export const StyledComponent = styled.div`
  .sort-receptionist-header {
    padding-left: 30px;
    padding-right: 30px;
  }
  .text-sort-receptionist {
    width: 100%;
    text-align: center;
    color: #8080da;

    &-border {
      padding: 5px;
      border: 1px solid #b0b0f2;
      background: #f0f0fe;
      color: #262626;
    }
  }

  .sort-receptionist {
    min-height: 400px;
    display: flex;
    align-content: center;
    row-gap: 8px !important;
    flex-direction: column;
    justify-content: center;

    &-Card {
      &-header {
        display: inline-flex;
        gap: 1px;
        &-left {
          width: 86px;
          text-align: center;
        }
        &-right {
          width: calc(100% - 86px);
          text-align: center;
        }
      }
      display: inline-flex;
      gap: 1px;
      height: 65px;
      &-left {
        button {
          height: 100%;
          padding: 0px 24px;
          width: 86px;
        }
      }
      &-right {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-content: space-between;
        gap: 1px;
        button {
          padding-left: 24px;
          padding-right: 24px;
        }
        .ant-btn > span {
          display: inline-block;
          width: 28px;
        }
      }
    }
  }
  .sort-receptionist-footer {
    display: inline-flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 24px;
    button {
      height: 40px;
      padding: 6px 24px;
    }
  }

  .button-gray {
    background: #5858b6;
    border-color: #5858b6;
    color: #fff;
  }
`;
