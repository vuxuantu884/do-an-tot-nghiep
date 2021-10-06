import { createGlobalStyle } from "styled-components";
import { globalCssCustomRadio } from "./radio";
import { reset } from "./reset";
import { globalCssSwitch } from "./switch";

/**
 * https://styled-components.com/docs/api#createglobalstyle
 * https://styled-components.com/docs/faqs
 */
export const GlobalStyle = createGlobalStyle`
  ${reset}
  ${globalCssCustomRadio}
  ${globalCssSwitch}
`;
