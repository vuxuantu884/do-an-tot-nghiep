import { Button, Card, Form, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import UrlConfig from "config/url.config";
import arrowLeft from "assets/icon/arrow-back.svg";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ProcurementDataResult, ProcurementImportResult, POImportResult } from "model/procurement";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { isEmpty } from "lodash";
import { ProcurementField } from "model/procurement/field";
import { ImportProcument, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { EnumImportStatus, EnumJobStatus } from "config/enum.config";
import { importProcumentAction } from "domain/actions/po/po-procument.action";
import { useDispatch } from "react-redux";
import { HttpStatus } from "config/http-status.config";
import { getJobImport } from "service/purchase-order/purchase-procument.service";
import { callApiNative } from "utils/ApiUtils";
import { listPurchaseOrderApi } from "service/purchase-order/purchase-order.service";
import { UploadFile } from "antd/es/upload/interface";
import moment from "moment";
import { EnumImportStep } from "../helper";
import { PRAutoCreateForm, PRAutoCreateResult, PRAutoCreateScanResult } from "./components";

type UploadStatus = "ERROR" | "SUCCESS" | "DONE" | "PROCESSING" | "REMOVED" | undefined;

type POImportResultMappingType = {
  id: number;
  pr_ids: Array<number>;
};

const ProcurementAutoCreateScreen: React.FC = () => {
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isResetModalWarning, setIsResetModalWarning] = useState<boolean>(false);
  const [dataResult, setDataResult] = useState<ProcurementDataResult>();
  const [linkFileImport, setLinkFileImport] = useState<string>();
  const [statusImport, setStatusImport] = useState<number>(EnumImportStep.DEFAULT);
  const [jobImportStatus, setJobImportStatus] = useState<EnumJobStatus>();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [lstJob, setLstJob] = useState<Array<string>>([]);
  const [errorMessage, setErrorMessage] = useState<Array<string>>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [procurementsResult, setProcurementsResult] = useState<Array<PurchaseProcument>>([]);
  const history = useHistory();
  const dispatch = useDispatch();

  const [formMain] = Form.useForm();

  const mapPurchaseOrdersToProcurements = (
    purchaseOrders: Array<PurchaseOrder>,
    poImportResult: Array<POImportResult>,
  ) => {
    const purchaseOrderImport: Array<POImportResultMappingType> = poImportResult.map(
      (el: POImportResult) => {
        return {
          ...el,
          id: parseInt(el.id),
          pr_ids: el.pr_ids.split(",").map((id: string) => parseInt(id)),
        };
      },
    );
    let procurementsResult: Array<PurchaseProcument> = [];
    if (purchaseOrders.length === poImportResult.length) {
      purchaseOrders.forEach((item: PurchaseOrder) => {
        purchaseOrderImport.forEach((po: POImportResultMappingType) => {
          if (po.id === item.id) {
            const procurementFilter = item.procurements.filter((pr: PurchaseProcument) =>
              po.pr_ids.includes(pr.id),
            );
            const newProcurement = procurementFilter.map((procurement: PurchaseProcument) => {
              return { ...procurement, purchase_order: item };
            });
            procurementsResult = procurementsResult.concat(newProcurement);
          }
        });
      });
    }
    const procurementsArrayResult = procurementsResult.sort((a, b) => {
      const dateA = moment.utc(a.expect_receipt_date).toDate().getTime();
      const dateB = moment.utc(b.expect_receipt_date).toDate().getTime();
      return dateA - dateB;
    });
    return procurementsArrayResult;
  };

  const getPOItems = useCallback(
    async (dataResult: ProcurementImportResult) => {
      if (dataResult.purchase_orders.length > 0) {
        const purchaseOrderIDs = dataResult.purchase_orders.map((item: POImportResult) => item.id);
        const ids = purchaseOrderIDs.join("&ids=");
        const listPoRes = await callApiNative(
          { isShowError: true },
          dispatch,
          listPurchaseOrderApi,
          { ids },
        );
        if (listPoRes) {
          const procurements = mapPurchaseOrdersToProcurements(
            listPoRes,
            dataResult.purchase_orders,
          );
          setProcurementsResult(procurements);
        } else {
          setUploadStatus(EnumJobStatus.error);
          setErrorMessage(["Không tìm thấy đơn nào"]);
        }
      }
    },
    [dispatch],
  );

  const checkImportFile = useCallback(() => {
    const getFilePromises = lstJob.map((code) => {
      return getJobImport(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === EnumJobStatus.finish) {
            if (
              response.data.message[0].purchase_orders &&
              response.data.message[0].purchase_orders.length > 0
            ) {
              getPOItems(response.data.message[0]);
              setDataResult(response.data);
              setUploadStatus(EnumJobStatus.success);
            } else if (!response.data.message[0].total_pr) {
              setUploadStatus(EnumJobStatus.error);
              setErrorMessage(["Không tìm thấy phiếu nhập kho nào"]);
            } else {
              setUploadStatus(EnumJobStatus.error);
              setErrorMessage(["Không tìm thấy đơn nào"]);
            }
            if (response.data.error > 0) {
              var downLoad = document.createElement("a");
              downLoad.href = response.data.url;
              downLoad.download = "download";
              downLoad.click();
              setErrorMessage(["Sản phẩm lỗi được hiển thị trong file tải về"]);
            }
            setJobImportStatus(EnumJobStatus.finish);
            setStatusImport(EnumImportStep.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = lstJob.filter((item) => {
              return item !== fileCode;
            });

            setLstJob(newListExportFile);
            return;
          } else if (response.data && response.data.status === EnumJobStatus.error) {
            setJobImportStatus(EnumJobStatus.error);
            setUploadStatus(EnumJobStatus.error);
            setStatusImport(EnumImportStep.JOB_FINISH);
            setErrorMessage(response.data.message);
            const fileCode = response.data.code;
            const newListExportFile = lstJob.filter((item) => {
              return item !== fileCode;
            });
            setLstJob(newListExportFile);
            return;
          }
          setJobImportStatus(EnumJobStatus.processing);
        }
      });
    });
  }, [getPOItems, lstJob, setDataResult, setJobImportStatus, setStatusImport]);

  const onResultImport = useCallback(
    (res) => {
      if (res) {
        const { status, code } = res;
        if (status === EnumImportStatus.processing) {
          setLstJob([code]);
          checkImportFile();
        }
      }
    },
    [checkImportFile],
  );

  //Đọc file excel chi tiết sản phẩm để map với DDH đã đặt
  const onFinish = () => {
    if (linkFileImport && linkFileImport.length > 0) {
      setIsShowModal(true);
      setUploadStatus(EnumImportStatus.processing);
      setStatusImport(EnumImportStep.CHANGE_FILE);
      const supplierId = formMain.getFieldValue([ProcurementField.supplier_id]);
      const storeId = formMain.getFieldValue([ProcurementField.store_id]);
      const note = formMain.getFieldValue([ProcurementField.note]);
      const params: ImportProcument = {
        url: linkFileImport,
        conditions: `${supplierId},${storeId}`,
        type: "IMPORT_PROCUREMENT_CREATE",
        note: note,
      };
      setJobImportStatus(EnumJobStatus.processing);
      dispatch(importProcumentAction(params, onResultImport));
    }
  };

  useEffect(() => {
    if (lstJob.length === 0 || jobImportStatus !== EnumJobStatus.processing) return;
    checkImportFile();
    const getFileInterval = setInterval(checkImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [lstJob, checkImportFile, jobImportStatus]);

  const onReset = useCallback(() => {
    formMain.resetFields();
    setProcurementsResult([]);
    setDataResult(undefined);
    setLinkFileImport("");
    setStatusImport(EnumImportStep.DEFAULT);
    setJobImportStatus(undefined);
    setUploadStatus(undefined);
    setLstJob([]);
    setErrorMessage([]);
    setIsResetModalWarning(false);
    setFileList([]);
  }, [formMain]);

  return (
    <ContentContainer
      title="Tạo phiếu nhập kho"
      breadcrumb={[
        {
          name: "Nhập kho",
          path: `${UrlConfig.PROCUREMENT}`,
        },
        {
          name: "Thêm mới phiếu nhập kho",
        },
      ]}
    >
      <Form form={formMain} onFinish={onFinish}>
        <Card>
          <PRAutoCreateForm
            formMain={formMain}
            procurementsResult={procurementsResult}
            setLinkFileImport={setLinkFileImport}
            setStatusImport={setStatusImport}
            statusImport={statusImport}
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            isShowModal={isShowModal}
            setIsShowModal={setIsShowModal}
            setFileList={setFileList}
            fileList={fileList}
          />
          {dataResult && <PRAutoCreateScanResult dataResult={dataResult} />}
        </Card>
        {!isEmpty(procurementsResult) && dataResult && (
          <Card>
            <PRAutoCreateResult formMain={formMain} procurementsResult={procurementsResult} />
          </Card>
        )}
      </Form>
      {isVisibleModalWarning && (
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => history.push(`${UrlConfig.PROCUREMENT}`)}
          okText="Đồng ý"
          cancelText="Tiếp tục"
          title={`Bạn có muốn rời khỏi trang?`}
          subTitle="Thông tin trên trang này sẽ không được lưu."
          visible={isVisibleModalWarning}
        />
      )}
      {isResetModalWarning && isEmpty(procurementsResult) && (
        <ModalConfirm
          onCancel={() => {
            setIsResetModalWarning(false);
          }}
          onOk={onReset}
          okText="Đồng ý"
          cancelText="Hủy bỏ"
          title={`Bạn có muốn tạo mới trang?`}
          subTitle="Thông tin trên trang này sẽ không được lưu."
          visible={isResetModalWarning}
        />
      )}
      <BottomBarContainer
        leftComponent={
          <div
            onClick={() => {
              const supplierId = formMain.getFieldsValue([ProcurementField.supplier_id]);
              const storeId = formMain.getFieldsValue([ProcurementField.store_id]);
              const file = formMain.getFieldsValue([ProcurementField.file]);
              if (supplierId !== undefined || storeId !== undefined || file !== undefined) {
                setIsVisibleModalWarning(true);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {"Quay lại danh sách"}
          </div>
        }
        rightComponent={
          <Space>
            <Button
              className="light"
              onClick={() => {
                !isEmpty(procurementsResult) ? onReset() : setIsResetModalWarning(true);
              }}
            >
              Tạo mới
            </Button>
            {!isEmpty(procurementsResult) ? (
              <Button type="primary" onClick={() => history.push(`${UrlConfig.PROCUREMENT}`)}>
                Xem danh sách phiếu
              </Button>
            ) : (
              <Button type="primary" onClick={() => formMain.submit()}>
                Xác nhận nhập
              </Button>
            )}
          </Space>
        }
      />
    </ContentContainer>
  );
};

export default ProcurementAutoCreateScreen;
