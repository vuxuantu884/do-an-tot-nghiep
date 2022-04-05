import {ArrowLeftOutlined} from "@ant-design/icons";
import {Button, Col, Row} from "antd";
import UrlConfig from "config/url.config";
import {Link} from "react-router-dom";
import {StyledComponent} from "../styles";

const AddOrderBottombar: React.FC<any> = (props: any) => {
  return (
    <StyledComponent>
      <div className="bottomBar">
        <Row gutter={24}>
          <Col md={12} style={{paddingLeft:"24px"}}>
            <Link to={`${UrlConfig.PACK_SUPPORT}/`} style={{float:"left", paddingTop:10, paddingRight:14, color:"#737373"}}>
                <ArrowLeftOutlined /> Đóng gói và biên bản bàn giao
            </Link>
          </Col>
          <Col md={12} style={{paddingRight:43}}>
            <Button
              style={{width:90, fontWeight: 400}}
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => window.location.reload()}
            >
              Đóng
            </Button>
            <Button
              loading={props?.isLoading}
              style={{width:120, fontWeight: 400}}
              type="primary"
              className="create-button-custom"
              onClick={props.onOkPress}
            >
              Thêm mới
            </Button>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
};

export default AddOrderBottombar;
