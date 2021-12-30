import styled from "styled-components";


export const StyledHashTag = styled.div`
  .custom-tags {
    padding: 10px;

    .tags-list {
        margin-bottom: 20px;
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

