import { createGlobalStyle } from "styled-components";
import { globalCssLayout } from "./layout";
import { globalCssLayoutOutsideComponent } from "./layoutOutsideComponent";
import { reset } from "./reset";

/**
 * https://styled-components.com/docs/api#createglobalstyle
 * https://styled-components.com/docs/faqs
 */
export const GlobalStyle = createGlobalStyle`
  ${reset}
  ${globalCssLayout}
  ${globalCssLayoutOutsideComponent}
`;
