import styled from "styled-components";

export const StyledComponent = styled.div`
  .shipment {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .shipment-item {
      display: flex;
      width: 45%;
      .title {
        width: 50%;
        display: inline-block;
      }
      .content {
        font-weight: bold;
      }
    }
  }
`;
