import styled from "styled-components";
import color from "assets/css/export-variable.module.scss";
import { ANT_PREFIX_CLS } from "utils/Constants";

export const StyledComponent = styled.div`
  .${ANT_PREFIX_CLS}-layout-header {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 99;
    justify-content: space-between;
    display: flex;
    line-height: 1;
  }

  .unicorn-layout-header-brand {
    align-items: center;
    justify-self: center;
    display: flex;
    padding: 0;
    width: 200px;

    .header-right {
      flex-direction: row-reverse;
      display: flex;
      width: 100%;

      .button-menu-collapse {
        display: flex;
        background-color: transparent;
        border: none;
        padding: 4px;
        width: auto;
        height: auto;
        align-items: center;
        &:hover {
          background-color: #f1f1f1;
        }
        &:focus,
        &:active {
          background-color: #f1f1f1;
          border: none;
        }
        &.svg {
          width: 24px;
          height: 24px;
          color: 8888;
        }
      }
    }
  }

  .unicorn-layout-header-body {
    display: flex;
    width: calc(100% - 200px);
    padding: 0 0 0 20px;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0px 2px 6px rgb(168 168 168 / 12%);
    .layout-user {
      height: 44px;
      background: #f5f5f5;
      border-radius: 21px;
      border: 1px solid #e5e5e5;
      max-width: 280px;
      padding: 4px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .sider-user-info {
        margin: 0 10px;
      }
    }
  }
  .notify-badge {
    vertical-align: middle;
  }
  .button-notify {
    border: none;
    padding: 0;
    display: flex;
    width: auto;
    height: auto;
    font-size: 20px;
    line-height: normal;
    align-items: center;
    background-color: transparent;
    &:focus,
    &:active {
      background-color: transparent;
      border: none;
    }
  }
  .ant-layout-header {
    transition: 0.3s;

    &.hide {
      top: -55px;
    }
    &.show {
      top: 0;
    }
  }
  .drop-down-button {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 100%;
    z-index: 1;
    padding: 5px 10px 10px;
    top: 100%;

    button {
      display: block;
      border-radius: 50%;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }
  .logo-header img {
    width: auto;
    height: 40px;
  }

  .markup-env {
    img {
      height: 30px;
    }
  }
  .avatar {
    flex-shrink: 0;
  }
  .support {
    display: flex;
    column-gap: 24px;
    .hotline {
      white-space: nowrap;
    }
    .phone-number {
      font-weight: bold;
      color: ${color.black};
    }

    &-link {
      display: flex;
      align-items: center;
      color: ${color.textMuted};
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
    &-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
    }
  }
  @media (max-width: 1280px) {
    .support {
      column-gap: 12px;
      &-content {
        display: none;
      }
      &-icon {
        width: 24px;
        height: 24px;
      }
    }
    .hotline {
      margin-right: 8px;
    }
  }
`;
