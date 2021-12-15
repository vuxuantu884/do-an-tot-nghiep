import styled from "styled-components";
import LoginBG from "assets/img/login_bg.jpg";
import YodyLogo from "assets/img/yody-logo.svg";
import YodyFashionLogo from "assets/img/yody-fashion-logo.svg";

export const StylesWrapper = styled.div`
.container-login{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${LoginBG});
  background-position: center center; 
  .login{
      position: absolute;
      width: 500px;
      @media screen and (max-width: 500px){
        width: 400px;
      }
      background-color: #fff;
      padding: 20px 40px;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
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
}
`;