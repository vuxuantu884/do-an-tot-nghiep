import { DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import BaseResponse from "base/base.response";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ExportFileModal, { ResultLimitModel } from "component/modal/ExportFileModal/ExportFileModal";
import { HttpStatus } from "config/http-status.config";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig, { WebAppProductTabUrl } from "config/url.config";
import { downloadWebAppProductAction, exitWebAppJobsAction, syncWebAppStockProductAction } from "domain/actions/web-app/web-app.actions";
import useAuthorization from "hook/useAuthorization";
import { WebAppRequestExportExcelQuery } from "model/query/web-app.query";
import NoPermission from "screens/no-permission.screen";
import { webAppExportFileProduct } from "service/other/export.service";
import { getProgressDownloadEcommerceApi } from "service/web-app/web-app.service";
import { isNullOrUndefined } from "utils/AppUtils";
import { DownloadFile } from "utils/DownloadFile";
import { ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";
import { showError, showSuccess } from "utils/ToastUtils";
import DownloadDataModal from "../components/DownloadDataModal";
import ProgressDownloadDataModal from "./ProgressDownloadDataModal";
import { StyledComponent } from "./styles";
import ProductList from "./tab/tabList/ProductList";
import ProductNotConnect from "./tab/tabNotConnected/ProductNotConnect";
import { PageResponse } from "model/base/base-metadata.response";

import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

export const ProcessTypeContants = {
    Export: "export",
    Download: "download",
    Sync: "sync",
    Connect: "connect",
    getTitle: (type: string) => {
        switch (type) {
            case ProcessTypeContants.Download:
                return "Tải sản phẩm cha";
            case ProcessTypeContants.Export:
                return "Xuất file sản phẩm";
            case ProcessTypeContants.Sync:
                return "Đồng bộ tồn";
            case ProcessTypeContants.Connect:
                return "Đồng bộ sản phẩm";
        }
    }
}

const WebAppProducts = () => {
    const [activeTab, setActiveTab] = useState<string>(WebAppProductTabUrl.TOTAL_ITEM);

    const { TabPane } = Tabs;
    const history = useHistory();
    const dispatch = useDispatch();

    //permission
    const productsReadPermission = [EcommerceProductPermission.products_read];
    const productsDownloadPermission = [EcommerceProductPermission.products_download];

    const [allowProductsDownload] = useAuthorization({
        acceptPermissions: productsDownloadPermission,
        not: false,
    });

    //state modal
    const [isShowProcessDownloadModal, setIsShowProcessDownloadModal] = useState(false);
    const [isShowExportFileModal, setIsShowExportFileModal] = useState(false);
    const [isShowDownloadDataModal, setIsShowDownloadDataModal] = useState(false);
    const [isShowConfirmCancelProcess, setIsShowConfirmCancelProcess] = useState(false);

    //state data
    const [isReloadData, setIsReloadData] = useState(false);
    const [progressData, setProgressData] = useState(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processType, setProcessType] = useState("");
    const [processId, setProcessId] = useState<any>();
    const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
    const [statusExport, setStatusExport] = useState<number>(ExportFileStatus.Export);
    const [params, setParams] = useState<any>();
    const [variantData, setVariantData] = useState<PageResponse<any>>({
        metadata: {
            limit: 30,
            page: 1,
            total: 0,
        },
        items: [],
    });

    useEffect(() => {
        switch (history.location.pathname) {
            case WebAppProductTabUrl.TOTAL_ITEM:
                setActiveTab(WebAppProductTabUrl.TOTAL_ITEM);
                break;
            case WebAppProductTabUrl.CONNECTED:
                setActiveTab(WebAppProductTabUrl.CONNECTED);
                break;
            case WebAppProductTabUrl.NOT_CONNECTED:
                setActiveTab(WebAppProductTabUrl.NOT_CONNECTED);
                break;
            default: break;
        }
    }, [history.location]);

    //export list
    const resultsExportFile: ResultLimitModel[] = [
        {
            value: ExportFileType.INPAGE,
            name: ExportFileType.INPAGE,
            title: "Sản phẩm trên trang này",
            isHidden: false,
            isChecked: true
        },
        {
            value: ExportFileType.SELECTED,
            name: ExportFileType.SELECTED,
            title: "Các sản phẩm được chọn",
            isHidden: selectedRows.length > 0 ? false : true,
            isChecked: false
        },
        {
            value: ExportFileType.CURRENT_SEARCH,
            name: ExportFileType.CURRENT_SEARCH,
            title: `${variantData.metadata.total} sản phẩm phù hợp với điều kiện tìm kiếm hiện tại`,
            isHidden: false,
            isChecked: false
        }
    ]

    //handle export file
    const handleExportFileProduct = (rows: Array<any>, params: any) => {
        setIsShowExportFileModal(true);
        setSelectedRows(rows);
        setParams(params);
        setProcessType(ProcessTypeContants.Export)
    }

    const handleExportFile = (exportType: string) => {
        let ids: Array<any> = [];
        if (exportType === ExportFileType.INPAGE) {
            ids = variantData.items.map((a: any) => {
                return a.id;
            })
        }
        else if (exportType === ExportFileType.SELECTED) {
            ids = selectedRows.map(a => {
                return a.id;
            })
        }
        const RequestExportExcel: WebAppRequestExportExcelQuery = {
            ...params,
            category_id: null,
            core_variant_id: null,
            variant_ids: ids,
        }
        if(activeTab === WebAppProductTabUrl.CONNECTED){
            RequestExportExcel.download_type = "connected";
        }
        if(activeTab === WebAppProductTabUrl.NOT_CONNECTED){
            RequestExportExcel.download_type = "waiting";
        }
        webAppExportFileProduct(RequestExportExcel)
            .then((response) => {
                if (response.code === HttpStatus.SUCCESS) {
                    showSuccess("Đã gửi yêu cầu xuất file");
                    setProcessId(response.data.process_id);
                    setStatusExport(ExportFileStatus.Exporting);
                }
            })
            .catch(() => {
                showError("Có lỗi xảy ra, vui lòng thử lại sau");
            });
    }
    const checkExportFile = () => {
        let getProgressPromises: Promise<BaseResponse<any>> = getProgressDownloadEcommerceApi(processId);

        Promise.all([getProgressPromises]).then((result) => {
            result.forEach((responses) => {
                if (responses) {
                    const processData = responses.data;
                    if (responses.code === HttpStatus.SUCCESS) {

                        if (processData.finish) {
                            if (!processData.api_error) {
                                setProgressPercent(100);
                                setProcessId(null);
                                setStatusExport(ExportFileStatus.ExportSuccess);
                                DownloadFile(responses.data.url)
                            }
                            else {
                                showError(processData.api_error);
                                setStatusExport(ExportFileStatus.ExportError);
                                setProcessId(null);
                            }
                        } else {
                            const percent = Math.floor(responses.data.total_success / responses.data.total * 100);
                            setProgressPercent(percent);
                        }
                    }
                    else {
                        setStatusExport(ExportFileStatus.ExportError);
                    }
                }
            });
        });
    }

    const handleCancelExportFile = () => {
        if (statusExport === ExportFileStatus.Exporting) {
            setIsShowConfirmCancelProcess(true);
        }
        else {
            setIsShowExportFileModal(false);
            resetProgress();
        }
    }

    useEffect(() => {
        if (processId) {
            if (statusExport === ExportFileStatus.Exporting && processType === ProcessTypeContants.Export) {
                checkExportFile();
            }
            if (processType === ProcessTypeContants.Download || processType === ProcessTypeContants.Sync || processType === ProcessTypeContants.Connect) {
                getProcessDownloadProduct();
            }
        }
        else
            return;
        if (processType === ProcessTypeContants.Export) {
            const getFileInterval = setInterval(checkExportFile, 3000);
            return () => clearInterval(getFileInterval);
        }
        if (processType === ProcessTypeContants.Download || processType === ProcessTypeContants.Sync || processType === ProcessTypeContants.Connect) {
            const downloadInterval = setInterval(getProcessDownloadProduct, 3000);
            return () => clearInterval(downloadInterval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusExport, processType, processId]);

    //handle download product
    const handleDownloadProduct = (params: any) => {
        setProcessType(ProcessTypeContants.Download);
        dispatch(downloadWebAppProductAction(params, (data: any) => {
            if (data) {
                setIsShowDownloadDataModal(false);
                if (typeof data !== "string") {
                    setProcessId(data.process_id);
                    setIsShowProcessDownloadModal(true);
                    setIsProcessing(true);
                }
            }
        }));
    }

    const resetProgress = () => {
        setProcessId(null);
        setProgressPercent(0);
        setProgressData(null);
        setStatusExport(ExportFileStatus.Export);
    }

    const getProcessDownloadProduct = () => {
        let getProgressPromises: Promise<BaseResponse<any>> = getProgressDownloadEcommerceApi(processId);
        Promise.all([getProgressPromises]).then((responses) => {
            responses.forEach((response) => {
                const processData = response.data;
                if (response.code === HttpStatus.SUCCESS && response.data && !isNullOrUndefined(processData.total)) {
                    setProgressData(response.data);
                    const progressCount = processData.total_created + processData.total_updated + processData.total_error;
                    if (processData.finish) {
                        setProgressPercent(100);
                        setProcessId(null);
                        setIsProcessing(false);
                        setIsReloadData(false);
                        if (!processData.api_error) {
                            if(processType === ProcessTypeContants.Download){
                                showSuccess("Tải sản phẩm thành công!")
                            }
                            else if(processType === ProcessTypeContants.Sync){
                                showSuccess("Đồng bộ tồn thành công!");
                            }
                            else if(processType === ProcessTypeContants.Connect){
                                showSuccess("Ghép nối sản phẩm thành công!");
                            }

                        } else {
                            resetProgress();
                            setIsShowProcessDownloadModal(false);
                            showError(processData.api_error);
                        }
                    } else {
                        const percent = Math.floor(progressCount / response.data.total * 100);
                        setProgressPercent(percent);
                    }
                }
            });
        });
    }

    //handle confirm cancel process
    const handleConfirmCancelProcess = () => {
        resetProgress();
        setIsShowConfirmCancelProcess(false);
        setIsShowProcessDownloadModal(false);
        setIsShowExportFileModal(false);
        if (processId) {
            dispatch(
                exitWebAppJobsAction(processId, (responseData) => {
                    if (responseData) {
                        showSuccess(responseData);
                    }
                })
            );
        }
    }

    //handle sync stock
    const handleSyncSingleStock = (item: any) => {
        const requestSyncStock = {
            sync_type: "selected",
            variant_ids: [item.id],
            shop_ids: null,
        };
        dispatch(
            syncWebAppStockProductAction(requestSyncStock, (result) => {
                if (result) {
                    setProcessType(ProcessTypeContants.Sync);
                    setProcessId(result.process_id);
                    setIsProcessing(true);
                    setIsShowProcessDownloadModal(true);
                }
            })
        );
    }

    const handleSyncMultiStock = (id: any) => {
        setProcessType(ProcessTypeContants.Sync);
        setProcessId(id);
        setIsProcessing(true);
        setIsShowProcessDownloadModal(true);
    }

    const handleCancelProcess = () => {
        setIsShowConfirmCancelProcess(true);
    }

    const handleProcessSuccess = () => {
        setIsShowProcessDownloadModal(false);
        setIsReloadData(true);
        resetProgress();
    }

    const handleMappingVariantJob = (id: any) => {
        setProcessType(ProcessTypeContants.Connect);
        setProcessId(id);
        setIsProcessing(true);
        setIsReloadData(true);
    }

    return (
        <StyledComponent>
            <ContentContainer
                title="Danh sách sản phẩm"
                breadcrumb={[
                    {
                        name: "Web/App",
                        path: `${UrlConfig.WEB_APP}`,
                    },
                    {
                        name: "Danh sách sản phẩm",
                    },
                ]}
                extra={
                    <>
                        {allowProductsDownload &&
                            <Button
                                onClick={() => setIsShowDownloadDataModal(true)}
                                className="ant-btn-outline ant-btn-primary"
                                size="large"
                                icon={<DownloadOutlined />}
                            >
                                Tải sản phẩm
                            </Button>
                        }
                    </>
                }
            >
                <AuthWrapper acceptPermissions={productsReadPermission} passThrough>
                    {(allowed: boolean) => (allowed ?
                        <>
                            <Tabs activeKey={activeTab} onChange={(tab) => {
                                history.push(tab);
                                setActiveTab("");
                            }}>
                                <TabPane tab="Tất cả sản phẩm" key={WebAppProductTabUrl.TOTAL_ITEM} />
                                <TabPane tab="Sản phẩm đã ghép" key={WebAppProductTabUrl.CONNECTED} />
                                <TabPane tab="Sản phẩm chưa ghép" key={WebAppProductTabUrl.NOT_CONNECTED} />
                            </Tabs>
                            {activeTab === WebAppProductTabUrl.TOTAL_ITEM &&
                                <ProductList
                                    type="all"
                                    exportFileProduct={handleExportFileProduct}
                                    syncSingleStock={handleSyncSingleStock}
                                    syncMultiStock={handleSyncMultiStock}
                                    getVariantData={setVariantData}
                                    isReloadData={isReloadData}
                                />
                            }
                            {activeTab === WebAppProductTabUrl.CONNECTED &&
                                <ProductList type="connected"
                                    exportFileProduct={handleExportFileProduct}
                                    syncSingleStock={handleSyncSingleStock}
                                    syncMultiStock={handleSyncMultiStock}
                                    getVariantData={setVariantData}
                                    isReloadData={isReloadData}
                                />
                            }
                            {activeTab === WebAppProductTabUrl.NOT_CONNECTED &&
                                <ProductNotConnect
                                    handleMappingVariantJob={handleMappingVariantJob}
                                    exportFileProduct={handleExportFileProduct}
                                    getVariantData={setVariantData}
                                    isReloadData={isReloadData}
                                />
                            }
                            {isShowDownloadDataModal && (
                                <DownloadDataModal
                                    visible={isShowDownloadDataModal}
                                    onOk={handleDownloadProduct}
                                    onCancel={() => setIsShowDownloadDataModal(false)}
                                />
                            )}
                            {isShowExportFileModal && (
                                <ExportFileModal
                                    results={resultsExportFile}
                                    visible={isShowExportFileModal}
                                    isExportList={true}
                                    onOk={(exportType) => handleExportFile(exportType)}
                                    title="sản phẩm"
                                    status={statusExport}
                                    onCancel={handleCancelExportFile}
                                    exportProgress={progressPercent}
                                />
                            )}
                            {isShowProcessDownloadModal &&
                                <ProgressDownloadDataModal
                                    visible={isShowProcessDownloadModal}
                                    onCancel={handleCancelProcess}
                                    onOk={handleProcessSuccess}
                                    progressData={progressData}
                                    progressPercent={progressPercent}
                                    isLoading={isProcessing}
                                    processType={processType}
                                />
                            }
                            <Modal
                                width="600px"
                                centered
                                visible={isShowConfirmCancelProcess}
                                title=""
                                okText="Xác nhận"
                                cancelText="Hủy"
                                onCancel={() => setIsShowConfirmCancelProcess(false)}
                                onOk={handleConfirmCancelProcess}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <img src={DeleteIcon} alt="" />
                                    <div style={{ marginLeft: 15 }}>
                                        <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy tải sản phẩm không?</strong>
                                        <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc tải sản phẩm, bạn vẫn có thể tải lại sau nếu muốn.</div>
                                    </div>
                                </div>
                            </Modal>
                        </>
                        : <NoPermission />)}
                </AuthWrapper>
            </ContentContainer>
        </StyledComponent>
    )
}
export default WebAppProducts;