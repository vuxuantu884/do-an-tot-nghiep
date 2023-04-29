import styled from "styled-components";

export const StyledComponent = styled.div`
  .text-shift-location-selector {
    width: 100%;
    text-align: center;
    color: #2a2a86;
  }

  .shift-location-selector {
    min-height: 400px;
    display: flex;
    align-content: center;

    &-bottom {
      margin-bottom: 15px;
    }
    &-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;

      button {
        white-space: initial;
        height: 70px;
        width: 31%;
        background: #5858b6;
      }
    }
  }
`;
