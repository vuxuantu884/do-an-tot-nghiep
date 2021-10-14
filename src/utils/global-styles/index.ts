import { createGlobalStyle } from "styled-components";
import { globalCssCustomButton } from "./button";
import { globalCssCustomCard } from "./card";
import { globalCssCustomForm } from "./form";
import { globalCssLayout } from "./layout";
import { globalCssCustomRadio } from "./radio";
import { reset } from "./reset";
import { globalCssSwitch } from "./switch";
import { globalCssCustomTable } from "./table";

/**
 * https://styled-components.com/docs/api#createglobalstyle
 * https://styled-components.com/docs/faqs
 */
export const GlobalStyle = createGlobalStyle`
  ${reset}
  ${globalCssCustomRadio}
  ${globalCssSwitch}
  ${globalCssCustomButton}
  ${globalCssCustomCard}
  ${globalCssCustomForm}
  ${globalCssCustomTable}
  ${globalCssLayout}
`;
