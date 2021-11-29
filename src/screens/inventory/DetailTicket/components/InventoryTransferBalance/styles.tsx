import styled from "styled-components";

export const StyledWrapper = styled.div`

`;

export const ModalWrapper = styled.div`
  .product-item-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 40px;
    border-radius: 3px;
    background-color: #f2f2f2;
    img {
      max-width: 30px;
      max-height: 40px;
      border-radius: 3px;
    }
  }

  width: 100%;

  h2 > span {
    color: #2A2A86;
  }

  .date-info {
    margin-bottom: 30px;
    .row-detail {
      display: flex;

      &-left.title {
        width: 90px;
      }
      &-right.data {
        font-weight: 600;
        margin-left: 3px;
      }
    }
  }

  .ant-row.note {
    margin-top: 30px;

    .note-body {
      height: 100px;
      display: block;
      padding: 10px 20px;
      border: 1px solid #E5E5E5;
    }
  }
`;