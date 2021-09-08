import styled from "styled-components";

export const StyledHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  .ant-btn {
    padding: 4px 15px;
    margin-right: 20px;
    background-color: transparent;

    &:first-child {
      border: 1px solid #222247;
      color: #222247;
      display: flex;
      align-items: center;
    }

    &:nth-child(2) {
      border: 1px solid #ea501f;
      color: #ea501f;
      display: flex;
      align-items: center;
      img {
        width: 32px;
        margin-right: 10px;
      }
    }
    &:nth-child(3) {
      border: 1px solid #00aaf0;
      color: #00aaf0;
      display: flex;
      align-items: center;
      & > div {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #00aaf0;
        margin-right: 10px;
        img {
          width: 28px;
        }
      }
    }
    &:last-child {
      border: 1px solid #0101b9;
      color: #00aaf0;
      display: flex;
      align-items: center;
      & > div {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
        img {
          width: 30px;
        }
      }
    }
  }
`;
