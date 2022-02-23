import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { StyledComponent } from "./styles";

const AddBankAccountBottombar: React.FC<any> = (props: any) => {
    return (
        <StyledComponent>
            <div className="bottomBar">
                <Row gutter={24}>
                    <Col md={12} style={{ paddingLeft: "24px" }}>
                        {/* <Link to={`${UrlConfig.PACK_SUPPORT}/`} style={{ float: "left", paddingTop: 10, paddingRight: 14, color: "#737373" }}>
                            <ArrowLeftOutlined />Quay lại danh sách
                        </Link> */}

                        <Button
                            style={{ float: "left", color: "#737373" }}
                            icon={<ArrowLeftOutlined />}
                            type="link"
                            onClick={() => window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.BANK_ACCOUNT}`}
                        >
                            Quay lại danh sách
                        </Button>
                    </Col>
                    <Col md={12} style={{ paddingRight: 43 }}>
                        <Button
                            style={{ width: 90, fontWeight: 400 }}
                            className="ant-btn-outline fixed-button cancle-button"
                            onClick={() => window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.BANK_ACCOUNT}`}
                        >
                            Hủy
                        </Button>
                        <Button
                            style={{ width: 120, fontWeight: 400 }}
                            type="primary"
                            className="create-button-custom"
                            onClick={props.onOkPress}
                        >
                            Lưu lại
                        </Button>
                    </Col>
                </Row>
            </div>
        </StyledComponent>
    );
};

export default AddBankAccountBottombar;
