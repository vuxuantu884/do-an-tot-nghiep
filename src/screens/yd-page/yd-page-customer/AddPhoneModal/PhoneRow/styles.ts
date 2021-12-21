import styled from "styled-components";

export const StyledComponent = styled.div`
  .phone-row-container {
    display: flex;
    flex-direction: row;
    .phone-container {
      flex: 1;
      justify-content: unset;
      .phone-txt {
        font-weight: bold;
      }
    }
    .phone-default-container {
    }
  }
`;
