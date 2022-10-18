import styled from "styled-components";
import { dangerColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .mainSection {
    margin-bottom: 70px;
  }
  .deleteOrderConfirm {
    &__note {
      text-align: justify;
      color: ${dangerColor};
    }
  }
  .orderRetuning {
    &__note {
      line-height: 10px;
      font-weight: 500;
      font-size: 15px;
      padding: 10px 0;
      ul {
        line-height: 18px;
        margin-bottom: 0;
      }
    }
  }
`;
export const UniformText = styled.span`
  color: red;
  font-weight: 800;
`;
