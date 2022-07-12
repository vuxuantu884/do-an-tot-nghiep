import styled from "styled-components";
import LoginBG from "assets/img/login_bg.jpg";
import YodyLogo from "assets/img/yody-logo.svg";
import YodyFashionLogo from "assets/img/yody-fashion-logo.svg";
import { Col } from "antd";

export const StylesWrapperRight = styled(Col)`
  padding-top:32px;
  padding-bottom:32px;
  @media screen and (max-width: 1280px){
    padding-top:16px;
  padding-bottom:16px;
        }
  .container-right {
    width: 65%;
    max-width: 500px;
    height: 100%;
    margin:0 auto;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: 500px){
          width: 400px;
    }
  }
  .hotline-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    img {
      width: 24px;
      height: 24px;
    }
    .hotline-group {
      display: flex;
    flex-direction: column;
    }
    .phone-number {
    font-weight: bold;
    &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
    a {
      color:#000000;
    }
  }


  .login{
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: #fff;
      padding: 20px 40px;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      @media screen and (max-width: 1280px){
        padding:0;
      }
      .forget-password {
        margin: -12px auto !important;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .quen-mk {
          color: #5656A2;
          cursor: pointer;
        }
      }
      .login-group {
        transform: translateY(-25%);

        @media screen and (max-width: 1280px){
          transform:initial;
        }
      }
      .login-form {
        margin-top: 20px;
        .row-form {
          margin-top: 10px;
        }
        label {
          ::before {
            content: '';
          }
          ::after {
            display: inline-block;
            margin-right: 4px;
            color: #ff4d4f;
            font-size: 14px;
            font-family: 'Inner';
            line-height: 1;
            content: "*";
          }
        }
      }
      .login-form-button {
        margin-top: 20px;
        width: 100%;
      }
      .login-title {
        text-align: center;
      }
      .username.ant-input-affix-wrapper{
        padding-right: 0 !important;
      }
  }
  .info-company{
    position: absolute;
    left: 50%;
    color: #fff;
    margin-top: 20px; 
    text-align: center;
    @media screen and (max-width: 500px){
      width: 400px;
    }
    @media screen and (min-height: 800px) {
      margin-top: 100px; 
    }
    @media screen and (max-height: 768px) {
      margin-top: 0px !important;
    }
    transform: translate(-50%,0px);
    -moz-transform: translate(-50%,0px);
    -webkit-transform: translate(-50%,0px);
    -o-transform: translate(-50%,0px);
    -ms-transform: translate(-50%,0px);
    .logo{
      background-image: url(${YodyLogo});
      background-position: center center; 
      width: 100px;
      height: 50px;
    }
    .lg-fashion{
      background-image: url(${YodyFashionLogo});
      background-position: center center; 
      width: 120px;
      height: 100px;
      background-repeat: no-repeat;
      background-size: contain; 
      margin: 0 auto;
    }
    .hello{
      font-size: 33px;
      padding-top: 20px;
      font-family: auto;
      font-weight: 700px;
      @media screen and (max-height: 768px) {
        padding-top: 5px;
      }
    }
    .fashion-tech{
      font-size: 13px;
    }
    .hello-info{
      padding-bottom: 20px;
    }
  }
  .copy-right {
    text-align: center;
    color: #666666;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
  }
`;

export const StylesWrapperLeft = styled(Col)`
  background: #000349;
  .container-left {
    width: 65%;
    margin-top: 12% !important;
    max-width: 500px;
    height: 87%;
    margin:0 auto;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: 1280px){
      margin-top: 5% !important;
        }
    
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      img {
        width: 120px;
      }
    }
    .yody-hello {
      text-align:center;
      font-family: 'utm-aptima';
      font-style: normal;
      font-weight: 700;
      font-size: 40px;
      line-height: 59px;
      color: #FFFFFF;
      margin-top: 16px;
      @media screen and (max-width: 1280px){
        margin-top: 12px;
        }
    }
    .logo-main {
      text-align: center;
      margin-top: 60px;
      @media screen and (max-width: 1280px){
        margin-top: 24px;
        }
      img  {
        width: 442px;
      }
    }
    .des1 {
      width: 420px;
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
      color: #FFFFFF;
      text-align: center;
      margin: 0 auto;
      margin-top: 42px;
      margin-bottom: 12px;
      @media screen and (max-width: 1280px){
        margin-top: 16px;
      margin-bottom: 8px;
        }
    }
    .des2 {
      width: 420px;
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      color: #FFFFFF;
      text-align: center;
      margin: 0 auto;
    }
  }
`;
