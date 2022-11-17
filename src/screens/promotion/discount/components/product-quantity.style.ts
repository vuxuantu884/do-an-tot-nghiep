import styled from "styled-components";

export const ProductQuantityStyle = styled.div`
  .list-option-release-promotion {
    display: flex;
    flex-direction: column;

    & label {
      padding: 4px 0;
    }
  }

  .list-apply-product-promotion {
    padding: 16px;
    margin: 20px 0;
    border: 1px solid #ebebeb;
    border-radius: 5px;

    .add-btn {
      display: flex;
      align-items: center;
      border: none;
      color: #2a2a86;
    }

    table {
      width: 100%;
    }

    .table-condition-body > tr > td {
      padding: 0 20px 0 0;
    }
  }

  .product-item-name {
    display: flex;
    flex-direction: column;

    &-detail {
      white-space: normal;
    }
  }
`;
