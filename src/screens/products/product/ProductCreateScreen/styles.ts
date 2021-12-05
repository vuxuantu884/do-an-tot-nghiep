import styled from "styled-components";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
    margin-top: 20px;
  }
  .extra-cards {
    width: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;
    & > b {
      margin-right: 10px;
    }
    & > label {
      margin-left: 10px;
    }
    &.status {
      width: 250px;
    }
  }
  .a-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .bpa {
      width: 165px;
      height: 165px;
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      row-gap: 10px;
      cursor: pointer;
      .ant-image {
        display: flex;
        width: 100%;
        height: 100%;
        img {
          object-fit: contain;
        }
      }
    }
  }
`;