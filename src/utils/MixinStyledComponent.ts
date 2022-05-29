import { css } from "styled-components";
// Mixin breakpoint
export const breakpoint = {
    phone: (...args: Parameters<typeof css>) => css`
      @media (max-width: 767.98px) {
        ${css(...args)}
      }
    `,
    tablet: (...args: Parameters<typeof css>) => css`
      @media (max-width: 991.98px) {
        ${css(...args)}
      }
    `,
    desktop: (...args: Parameters<typeof css>) => css`
      @media (max-width: 1199.98px) {
        ${css(...args)}
      }
    `,
};
