import styled from "styled-components";

export const SocialStyled = styled.div`
  height: 100%;
  .page-header {
    height: auto;
  }
  .ydpage-body {
    height: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    .image {
      margin-top: 40px;
      @media screen and (max-width: 640px) {
        width: 90%;
      }

      @media screen and (max-width: 768px) {
        width: 85%;
      }

      @media screen and (max-width: 1024px) {
        width: 65%;
      }
    }
    .text-description {
      margin-top: 30px;
      text-align: center;
      .label {
        font-weight: 600;
        font-size: 30px;
        line-height: 38px;
        color: #2a2a86;
      }
      .description {
        margin-top: 4px;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
    .button-option {
      margin-top: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      .social-button {
        padding: 12px;
        display: flex;
        align-items: center;
        @media screen and (max-width: 640px) {
          width: 400px;
        }
        height: 100px;
        box-shadow: 0 4px 10px 0 #0000001a;
        background: #ffffff;
        border-radius: 5px;
        &:hover {
          cursor: pointer;
          transition: 0.5s;
          box-shadow: 0 4px 10px 0 gray;
        }
        .text-button-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 22px;
          .beta-text {
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            color: #52c41a;
            background: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 2px;
            padding: 1px 8px;
          }
        }
        .description-text {
          color: #595959;
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
        }
      }
    }
  }
  .ydpage-iframe {
    width: calc(100% + 40px) !important;
    height: calc(100% + 55px) !important;
    display: flex;
    margin-left: -20px;
    border: none;
  }
`;
