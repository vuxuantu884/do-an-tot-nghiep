import styled from "styled-components";
import { successColor, textBodyColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .cannotClone {
    padding: 20px 0;
  }
  .mainSection {
    margin-bottom: 70px;
  }
  .successTag {
    color: ${successColor};
    background-color: rgba(39, 174, 96, 0.1);
  }
  .expectReceivedDate {
    color: ${textBodyColor};
    img {
      position: relative;
      top: -2px;
      margin-right: 5px;
    }
  }
  .officeTime {
    margin-left: 6px;
    color: #737373;
    font-size: 1rem;
  }
  .cancelledFulfillment {
    display: none;
  }
  .activeFulfillment {
    margin-top: -12px;
    margin-bottom: 20px;
  }
`;
