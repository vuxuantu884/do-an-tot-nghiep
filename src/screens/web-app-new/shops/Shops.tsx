import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Tabs } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { WebAppConfigTabUrl } from "config/url.config";
import { getWebAppShopList, webAppConfigDeleteAction } from "domain/actions/web-app/web-app.actions";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import { showSuccess } from "utils/ToastUtils";
import ShopList from "./list/ShopList";
import connectedShopIcon from "assets/icon/connected_shop.svg";
import { StyledComponent, StyledConfirmUpdateShopModal } from "./styles";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg"
import CreateShopModal from "./CreateShopModal";
import ConfigShop from "./config/ConfigShop";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";

type WebAppShopParams = {
    id: string;
}

const WebAppShops = () => {
    const { TabPane } = Tabs;
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<string>(WebAppConfigTabUrl.SHOP_LIST);
    const history = useHistory();
    const { id } = useParams<WebAppShopParams>();
    const shopsReadPermission = [EcommerceConfigPermission.shops_read];

    const [isLoading, setIsLoading] = useState(true);
    const [shopList, setShopList] = useState<Array<WebAppResponse>>([]);
    const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)
    const [isShowCreateShopModal, setIsShowCreateShopModal] = useState(false);
    const [modalShopInfo, setModalShopInfo] = useState<WebAppResponse>()
    const [isConfirmUpdateShop, setIsConfirmUpdateShop] = useState(false);

    useEffect(() => {
        switch (history.location.pathname) {
            case WebAppConfigTabUrl.SHOP_LIST:
                setActiveTab(WebAppConfigTabUrl.SHOP_LIST);
                break;
            case WebAppConfigTabUrl.CONFIG_SHOP:
                setActiveTab(WebAppConfigTabUrl.CONFIG_SHOP);
                break;
            default:
                if (history.location.pathname.includes(WebAppConfigTabUrl.CONFIG_SHOP))
                    setActiveTab(WebAppConfigTabUrl.CONFIG_SHOP);
                else
                    setActiveTab(WebAppConfigTabUrl.SHOP_LIST);
                break;
        }
    }, [history.location]);

    

    //handle change tab
    const handleOnchangeTab = (active: any) => {
        getShopList();
        history.push(active);
    }

    //handle delete shop
    const handleShowDeleteModal = (item: any) => {
        setModalShopInfo(item)
        setIsShowDeleteModal(true)
    }

    const handleDeleteShop = () => {
        setIsShowDeleteModal(false)
        if (modalShopInfo) {
            dispatch(webAppConfigDeleteAction(modalShopInfo.id, (result: any) => {
                if (result) {
                    showSuccess("Xóa gian hàng thành công")
                    getShopList()
                    history.push(`${WebAppConfigTabUrl.SHOP_LIST}`);
                }
            }))
        }
    }

    //get shop list
    const getShopList = () => {
        dispatch(getWebAppShopList({}, (responseData) => {
            setIsLoading(false);
            setShopList(responseData);
        }));
    }
    useEffect(() => {
        getShopList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <StyledComponent>
            <ContentContainer
                title="Web/App"
                breadcrumb={[
                    {
                        name: "Web/App",
                        path: `${UrlConfig.WEB_APP}`,
                    },
                    {
                        name: "Cấu hình",
                    },
                ]}
                extra={
                    <>
                        <div>
                            <Button
                                className="ant-btn-outline ant-btn-primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => setIsShowCreateShopModal(true)}
                            >
                                Tạo mới gian hàng
                            </Button>
                        </div>
                    </>
                }
            >
                <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
                    {(allowed: boolean) => (allowed ?
                        <>
                            <Card className="card-tab">
                                <Tabs
                                    activeKey={activeTab} onChange={(active) => { handleOnchangeTab(active) }}
                                    renderTabBar={RenderTabBar}
                                >
                                    <TabPane tab="Gian hàng" key={WebAppConfigTabUrl.SHOP_LIST} />
                                    <TabPane tab="Cấu hình gian hàng" key={WebAppConfigTabUrl.CONFIG_SHOP} />
                                </Tabs>
                                {activeTab === WebAppConfigTabUrl.SHOP_LIST &&
                                    <ShopList
                                        data={shopList}
                                        showDeleteModal={handleShowDeleteModal}
                                        loading={isLoading}
                                    />
                                }
                                {activeTab === WebAppConfigTabUrl.CONFIG_SHOP &&
                                    <ConfigShop
                                        shopList={shopList}
                                        showDeleteModal={handleShowDeleteModal}
                                        id={id}
                                    />
                                }
                            </Card>
                            <CreateShopModal
                                visible={isShowCreateShopModal}
                                onOK={() => {
                                    getShopList();
                                    setIsShowCreateShopModal(false);
                                    showSuccess("Thêm mới gian hàng thành công");
                                }}
                                onCancel={() => {
                                    setIsShowCreateShopModal(false);
                                }}
                            >
                            </CreateShopModal>
                            {/* Confirm modal to delete shop */}
                            <Modal
                                onCancel={() => setIsShowDeleteModal(false)}
                                onOk={handleDeleteShop}
                                visible={isShowDeleteModal}
                                okText="Đồng ý"
                                cancelText="Hủy"
                                title="Xoá gian hàng?"
                                width={600}
                                centered
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <img src={DeleteIcon} alt="" />
                                    <span style={{ fontSize: 16, marginLeft: 15 }}>Bạn có chắc chắn xóa gian hàng <strong>{modalShopInfo?.name}</strong> này không?</span>
                                </div>
                            </Modal>
                            {isConfirmUpdateShop &&
                                <Modal
                                    visible={isConfirmUpdateShop}
                                    onCancel={() => {
                                        setIsConfirmUpdateShop(false);
                                    }}
                                    okText="Đồng ý"
                                    onOk={() => {
                                        setIsConfirmUpdateShop(false);
                                        history.replace(`${history.location.pathname}#setting`);
                                    }}
                                >
                                    <StyledConfirmUpdateShopModal>
                                        <div className="confirm-update-shop">
                                            <div className="image"><img src={connectedShopIcon} alt="connectedShopIcon" /></div>
                                            <div>
                                                <div className="title">Gian hàng đã tồn tại trên hệ thống</div>
                                                <div>Bạn có muốn chỉnh sửa cấu hình gian hàng không?</div>
                                            </div>
                                        </div>
                                    </StyledConfirmUpdateShopModal>
                                </Modal>
                            }
                        </>
                        : <NoPermission />)}
                </AuthWrapper>
            </ContentContainer>
        </StyledComponent>
    )
}
export default WebAppShops;