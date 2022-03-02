import { Button, Card } from "antd";
import NoPermissionImg from "assets/img/no-permission.png";
import React from "react";
import { AiOutlineRollback } from "react-icons/ai";
import { useHistory } from "react-router";
import styled from "styled-components";
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
    img {
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
  }
`;

function NoPermission() {
    const history = useHistory();
  return (
    <NopermissionStyle>
      <Card className="container-card">
        <div className="content">
          <img src={NoPermissionImg} alt="No Permission" />
          <h1>Bạn không có quyền truy cập!</h1>
          <span className="guidline">
            Bạn không có quyền truy cập tính năng này.
            <br />
           <a href="tel:0888464258" title="HOTLINE PHÒNG IT: 0888464258">Vui lòng liên hệ bộ phận hỗ trợ!</a>
          </span>

          <Button type="primary" icon={<AiOutlineRollback />} className="back-btn" onClick={()=>history.goBack()}>
            &nbsp; Quay lại
          </Button>
        </div>
      </Card>
    </NopermissionStyle>
  );
}

export default NoPermission;
