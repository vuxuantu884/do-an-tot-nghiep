import styled from "styled-components";

export const StyledComponent = styled.div`
  .avatar-list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
    grid-gap: 10px;
    .img-frame {
      position: relative;
      img {
        border-radius: 0;
        width: 100%;
        height: 165px;
        object-fit: cover;
        cursor: pointer;
      }
      .av-checkbox {
        position: absolute;
        bottom: 10px;
        right: 20px;
      }
    }
  }
  .avatar-show {
    width: 200px;
    height: 200px;
    border: 1px dashed #d9d9d9;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
`;
