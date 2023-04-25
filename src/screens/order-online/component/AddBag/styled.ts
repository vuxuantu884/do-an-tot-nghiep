import styled from "styled-components";
import { borderColor, grayF5Color, primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  ul.bags {
    padding: 0;
    list-style-type: none;
    background: #f0f0fe;
    margin: 0;
    li {
      cursor: pointer;
      border: 1px solid ${borderColor};
      border-radius: 5px;
      padding: 7px 40px 7px 8px;
      background: #fff;
      width: 316px;
      position: relative;
      &:not(:last-child) {
        margin-bottom: 6px;
      }
      &:hover {
        background: ${grayF5Color};
      }
      .icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 8px;
        &:hover {
          width: 30px;
          box-shadow: 2px #888888;
          top: 50%;
          /* transform: translateY(-13%); */
        }
      }
    }
    .giftSku {
      font-weight: 600;
      color: ${primaryColor};
    }
  }
`;
