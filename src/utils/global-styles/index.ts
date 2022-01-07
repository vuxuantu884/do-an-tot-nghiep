import { createGlobalStyle } from "styled-components";
import { globalCssCustomButton } from "./button";
import { globalCssCustomCard } from "./card";
import { globalCssCustomCheckbox } from "./tree";
import { globalCssCustomForm } from "./form";
import { globalCssCustomInput } from "./input";
import { globalCssLayout } from "./layout";
import { globalCssLayoutOutsideComponent } from "./layoutOutsideComponent";
import { globalCssCustomRadio } from "./radio";
import { reset } from "./reset";
import { globalCssCustomSelect } from "./select";
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
  ${globalCssCustomSelect}
  ${globalCssCustomInput}
  ${globalCssLayout}
  ${globalCssLayoutOutsideComponent}
  ${globalCssCustomCheckbox}
`;
