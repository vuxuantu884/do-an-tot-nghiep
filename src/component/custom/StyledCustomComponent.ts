import styled from "styled-components";


export const StyledHashTag = styled.div`
  .custom-tags {
    padding: 10px;

    .tags-list {
      margin-bottom: 0px;
      .tag {
        box-sizing: border-box;
        margin: 0 8px 10px 0;
        color: #000000d9;
        display: inline-block;
        padding: 0 7px;
        font-size: 14px;
        white-space: nowrap;
        background: #fafafa;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        opacity: 1;
        transition: all .3s;
        img {
          width: 18px;
          margin-left: 3px;
          cursor: pointer;
        }
      }
    }

    .ant-input {
      padding: 0 10px;
      height: 26px;
      width: 100px;
      &:focus {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
      }
    }
  }
`;

