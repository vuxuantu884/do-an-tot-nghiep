import styled from "styled-components";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
const top = `top: ${OFFSET_HEADER_UNDER_NAVBAR}px`;

export const StickyUnderNavbar = styled.div`
  position: -webkit-sticky;
  position: sticky;
  ${top};
  z-index: 3;
`;
