import { Button, Card, Col, Row, Tooltip } from "antd";
import NoPermissionImg from "assets/img/no-permission.png";
import React from "react";
import { AiOutlineRollback } from "react-icons/ai";
import { useHistory } from "react-router";
import styled from "styled-components";
import hotlineCBIcon from "assets/icon/cb.svg";
import { hotlineCBNumber } from "../config/app.config";
import gapoIcon from "assets/icon/gapo.svg";
import { DoubleRightOutlined } from "@ant-design/icons";
const NopermissionStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 80vh;
  .container-card {
    width: 100%;
  }
  .content {
    height: 64vh;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    align-items: center;
    .img {
      margin-bottom: 20px;
    }
    .guidline {
      color: #666666;
    }
    .back-btn {
      display: inline-flex;
      margin-top: 10px;
      align-items: center;
    }
    .hotline-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 16px;
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
        color: #000000;
      }
    }
  }
  .ant-card-bordered {
    border: none;
  }
  .ant-card {
    box-shadow: none;
  }
  .anticon svg {
    width: 10px;
  }
`;

function NoPermission() {
  const history = useHistory();

  const callHotlineCBSupport = () => {
    window.location.href = `tel:${hotlineCBNumber}`;
  };

  return (
    <NopermissionStyle>
      <Card className="container-card">
        <div className="content">
          <img className="img" src={NoPermissionImg} alt="No Permission" />
          <h1>Bạn không có quyền truy cập!</h1>
          <span className="guidline">
            Bạn không có quyền truy cập tính năng này.
            <br />
            <a
              href="tel:0888464258"
              title="HOTLINE PHÒNG IT: 0888464258"
              style={{ color: "#666666" }}
            >
              Vui lòng liên hệ bộ phận hỗ trợ!
            </a>
          </span>

          <Row gutter={24} align="middle" style={{ width: "50%", margin: "20px 0" }}>
            <Col span={12}>
              <div className="hotline-info" style={{ justifyContent: "end", marginRight: 10 }}>
                <img style={{ marginRight: 5 }} src={hotlineCBIcon} alt="hotlineCB" />
                <span className="hotline-group">
                  <span style={{ marginBottom: "-3px", color: "#595959" }}> {"C&B - Hotline"}</span>
                  <Tooltip title="Click để gọi Vân Anh C&B" color="blue" placement="bottom">
                    <span className="phone-number" onClick={callHotlineCBSupport}>
                      {hotlineCBNumber}
                    </span>
                  </Tooltip>
                </span>
              </div>
            </Col>
            <Col span={12}>
              <a
                style={{ color: "#595959", justifyContent: "start", marginLeft: 10 }}
                className="hotline-info"
                href="https://www.gapowork.vn/group/unicorn"
                target="_bank"
              >
                <img style={{ marginRight: 5 }} src={gapoIcon} alt="gapo" />
                <span>
                  {" "}
                  {"Nhóm hỗ trợ "}{" "}
                  <span style={{ fontWeight: 600 }}>
                    Gapo <DoubleRightOutlined />
                  </span>
                </span>
              </a>
            </Col>
          </Row>

          <Button
            type="primary"
            icon={<AiOutlineRollback />}
            className="back-btn"
            onClick={() => history.goBack()}
          >
            &nbsp; Quay lại
          </Button>
        </div>
      </Card>
    </NopermissionStyle>
  );
}

export default NoPermission;
