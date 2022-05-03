import { Button, Col, Form, FormInstance, Input, Modal, Row } from "antd"
import { webAppCreateShopify, webAppGetInfoShopify } from "domain/actions/web-app/web-app.actions";
import { WebAppCreateShopifyRequest } from "model/query/web-app.query";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { createRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
type CreateShopModalProps = {
    visible: boolean;
    onOK: () => void;
    onCancel: () => void;
}
const CreateShopModal: React.FC<CreateShopModalProps> = (props: CreateShopModalProps) => {
    const {visible,onOK,onCancel} = props;
    const dispatch = useDispatch();
    const formRef = createRef<FormInstance>();

    //state
    const [infoShop,setInfoShop] = useState<WebAppCreateShopifyRequest>({
        id: 0,
        ecommerce_shop: "",
        website: "",
        name: "",
        inventorySync: ""
    })
    const [statusCreate,setStatusCreate] = useState("get_info");
    useEffect(() => {
        formRef.current?.setFieldsValue({
            api_key: "",
            api_secret: ""
        });
        setStatusCreate("get_info");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[visible]);
    const [loading,setLoading] = useState(false);

    const callbackGetInfoShopify = (result: WebAppResponse) => {
        setLoading(false);
        if(result){
            setStatusCreate("info_shop");
            setInfoShop({...infoShop,
                id: result.id,
                website: result.website,
                name: result.name,
                inventorySync: result.inventory_sync
            })
        }
    }
    const callbackCreateShopify = (result: WebAppResponse) => {
        setLoading(false);
        if(result){
            onOK();
        }
    }
    const handleCreateShop = () => {
        formRef.current?.validateFields();
        setLoading(true);
        if(statusCreate === "get_info"){
            const api_key = formRef.current?.getFieldValue("api_key");
            const api_secret = formRef.current?.getFieldValue("api_secret");
            dispatch(webAppGetInfoShopify(api_key,api_secret,callbackGetInfoShopify));
        }
        else{
            dispatch(webAppCreateShopify(infoShop,callbackCreateShopify));
        }
    }
    return (
        <Modal
            onCancel={onCancel}
            visible={visible}
            title="Thêm mới gian hàng"
            footer={[
                <Button
                    key="cancel"
                    className="create-button-custom ant-btn-outline fixed-button"
                    onClick={onCancel}
                >
                    Thoát
                </Button>,
                <Button key="ok"
                    type="primary"
                    onClick={handleCreateShop}
                    loading={loading}
                >
                    {statusCreate === "get_info" ? "Kết nối": "Tạo gian hàng"}
                </Button>,
                    
            ]}
        >
            {statusCreate === "get_info" && (
                <Form
                    ref={formRef}
                    layout="horizontal"
                >
                    <Row gutter={50}>
                        <Col span={24}>
                            <Form.Item
                                rules={[
                                    {required: true, message: "Vui lòng nhập Api Token"}
                                ]}
                                labelCol={{ span: 4 }}
                                label="Api key"
                                name="api_key"
                                labelAlign={"left"}
                            >
                                <Input style={{textAlign: "left",width: "100%"}} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={30}>
                        <Col span={24}>
                            <Form.Item
                                rules={[
                                    {required: true, message: "Vui lòng nhập Api secret"}
                                ]}
                                labelCol={{ span: 4 }}
                                label="Api secret"
                                name="api_secret"
                                labelAlign={"left"}
                            >
                                <Input style={{textAlign: "left",width: "100%"}} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            )}
            {statusCreate === "info_shop" && (
                <div>
                    <Row gutter={5}>
                        <Col span={10}><span style={{fontWeight: 500}}>Tên gian hàng:</span></Col>
                        <Col span={14}>
                            {infoShop.name}
                        </Col>
                    </Row>
                    <Row gutter={5}>
                        <Col span={10}><span style={{fontWeight: 500}}>Website:</span></Col>
                        <Col span={14}>
                            {infoShop.website}
                        </Col>
                    </Row>
                </div>
            )}
        </Modal>
    )
}
export default CreateShopModal;