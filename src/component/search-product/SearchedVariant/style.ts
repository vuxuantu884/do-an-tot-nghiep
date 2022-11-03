import styled from "styled-components";

export const StyledComponent = styled.div`
  .selected-searched-variant {
    display: flex;
    place-content: center space-between;
    height: 60px;
    padding: 10px 15px;
    .variant-columns-1 {
      align-items: center;
      justify-content: flex-start;
      display: flex;
      img {
        max-height: 50px;
        border-radius: 5px;
      }
    }
    .variant-columns-2 {
      &-color-sku {
        color: #95a1ac;
      }
    }
    .variant-columns-3 {
      text-align: right;
      .price {
        text-decoration: underline rgb(115, 115, 115);
      }
    }
  }

  .black-color {
    color: #222222;
  }
  .gray-color {
    color: #737373;
  }
  .text-ellipsis {
    display: block;
  }
`;
