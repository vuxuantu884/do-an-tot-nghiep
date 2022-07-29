import styled from "styled-components";
import { bluePlus } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .label {
    font-size: 18px;
    font-weight: 500;
    color: #2a2a86;
  }
  .yody-icon {
    font-size: 50px;
  }
  .active {
    color: #2a2a86;
  }
  .deactive {
    color: #757575;
  }
  .button-plus {
    width: 37px !important;
    height: 37px !important;
    padding: 0;
    color: ${bluePlus};
  }
  .care-title {
    font-weight: 500;
    font-size: 1rem;
    margin: 6px 8px 15px 0;
  }
  .care-label {
    font-size: 28px;
    margin: 0px 4px;
    line-height: 32px;
  }
  .button-plus {
    border: 1px solid #e5e5e5;
    background: #ffffff;
    color: #757575;
  }
`;
