import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-row {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  .reference-good-receipt {
    font-weight: 500;
    color: rgb(226, 67, 67);
    display: block;
  }
  .rowDetail {
    &__value {
      font-weight: 500;
    }
  }
`;
