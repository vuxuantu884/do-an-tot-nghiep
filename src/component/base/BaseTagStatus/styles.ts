import styled from "styled-components";
import Color from "assets/css/export-variable.module.scss";


export const StyledComponent = styled.span`
  .tag {
    border-radius: 100px;
    padding: 5px 10px;
    
    &-blue {
      background: ${Color.blueSecondary};
      color: ${Color.primary};
    }
    &-green {
      background:  ${Color.greenSecondary};
      color: ${Color.green};
    }
    &-gray {
      background: ${Color.grayF5};
      color: ${Color['text-muted']};
    }
  }
  .full {
    width: 100%
  }
`
