import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Space, Tag, Typography, Upload } from "antd";
import dashboardIcon from "assets/icon/dashboard.svg";
import importIcon from "assets/icon/import-card.svg";
import {
  ApprovalPoProcumentAction,
  ConfirmPoProcumentAction,
  PoProcumentCreateAction,
  PoProcumentDeleteAction,
  PoProcumentUpdateAction,
} from "domain/actions/po/po-procument.action";
import { PoUpdateAction } from "domain/actions/po/po.action";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { POProgressResult, PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import moment, { Moment } from "moment";
import React, { lazy, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { POStatus, ProcumentStatus } from "utils/Constants";
import * as XLSX from "xlsx";

import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import excelIcon from "assets/icon/icon-excel.svg";
import { ProcurementField } from "model/procurement/field";
import {
  POExpectedDateField,
  ProcurementExportLineItemField,
} from "model/purchase-order/puschase-expected-date.modules";
import { ConvertDateToUtc } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import POInventoryView from "./po-inventory/po-inventory.view";
import { POModelCreateFile } from "./po-model-create-file";
import { PoPrTable } from "./po-pr-table";
import { PurchaseOrderCreateContext } from "../provider/purchase-order.provider";
import YDProgressModal, { YDProgressModalHandle } from "../POProgressModal";

const ProcumentConfirmModal = lazy(() => import("../modal/procument-confirm.modal"));
const ProcumentInventoryModal = lazy(() => import("../modal/procument-inventory.modal"));
const ProcumentModal = lazy(() => import("../modal/procument.modal"));
const POEditDraftProcurementModal = lazy(() => import("../modal/POEditDraftProcurementModal"));

export type POInventoryFormProps = {
  loadDetail?: (poId: number, isLoading: boolean, isSuggest: boolean) => void;
  stores: Array<StoreResponse>;
  status: string;
  now: Moment;
  isEdit: boolean;
  onAddProcumentSuccess?: (isSuggest: boolean) => void;
  idNumber?: number;
  poData?: PurchaseOrder;
  formMain?: any;
  isShowStatusTag?: boolean;
  isEditDetail?: boolean;
};

export interface POExpectedDate {
  index: number;
  date: Date | string;
  value: number;
  option: "%" | "SL";
}

const TAB = [
  {
    name: "Tổng quan",
    id: 1,
    icon: dashboardIcon,
  },
  // {
  //   name: "Phiếu nháp",
  //   id: 4,
  //   icon: editIcon,
  // },
  // {
  //   name: "Phiếu đã duyệt",
  //   id: 3,
  //   icon: checkIcon,
  // },
  {
    name: "Phiếu nhập kho",
    id: 2,
    icon: importIcon,
  },
];
const POInventoryFormCreate: React.FC<POInventoryFormProps> = (props: POInventoryFormProps) => {
  const {
    stores,
    status,
    now,
    idNumber,
    onAddProcumentSuccess,
    poData,
    formMain,
    isShowStatusTag,
    loadDetail,
    isEditDetail,
  } = props;

  const { procurementTableData } = useContext(PurchaseOrderCreateContext);

  const [activeTab, setActiveTab] = useState(TAB[0].id);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleEditProcurement, setVisibleEditProcurement] = useState(false);
  const [visibleDraft, setVisibleDraft] = useState(false);
  const procumentCodeRef = useRef("");
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [draft, setDraft] = useState<PurchaseProcument | null>(null);
  const [procumentDraft, setProcumentDraft] = useState<PurchaseProcument | null>(null);
  const [procurements, setProcurements] = useState<Array<PurchaseProcurementViewDraft>>([]);
  const [procumentInventory, setProcumentInventory] = useState<PurchaseProcument | null>(null);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const [isEditProcument, setEditProcument] = useState<boolean>(false);
  const [loadingEditDraft, setLoadingEditDraft] = useState<boolean>(false);
  const [dataProgress, setDataProgress] = useState<POProgressResult>();

  const refProgressModal = useRef<YDProgressModalHandle>(null);
  const onAddProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingCreate(false);
      if (value === null) {
      } else {
        if (isEditProcument) showSuccess("Lưu phiếu nhập kho nháp thành công");
        else showSuccess("Thêm phiếu nhập kho nháp thành công");
        setVisible(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [isEditProcument, onAddProcumentSuccess],
  );

  const onAddProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber) {
        if (!poData) return;
        setLoadingCreate(true);
        if (isEditProcument) {
          dispatch(PoProcumentUpdateAction(idNumber, value.id, value, onAddProcumentCallback));
        } else {
          dispatch(PoProcumentCreateAction(idNumber, value, onAddProcumentCallback));
        }
      }
    },
    [idNumber, poData, isEditProcument, dispatch, onAddProcumentCallback],
  );

  const onDeleteProcumentCallback = useCallback(
    (result) => {
      if (result !== null) {
        setLoadingCreate(false);
        showSuccess("Huỷ phiếu nháp thành công");
        setVisible(false);
        setVisibleDraft(false);
        setVisibleConfirm(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess],
  );

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        setLoadingCreate(true);
        dispatch(PoProcumentDeleteAction(idNumber, value.id, onDeleteProcumentCallback));
      }
    },
    [dispatch, idNumber, onDeleteProcumentCallback, poData],
  );

  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setVisibleDraft(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess],
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        setLoadingConfirm(true);
        dispatch(ApprovalPoProcumentAction(idNumber, value.id, value, onConfirmProcumentCallback));
      }
    },
    [dispatch, idNumber, onConfirmProcumentCallback, poData],
  );

  const onReciveProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Xác nhận nhập kho thành công");
        setVisibleConfirm(false);
        setLoadingRecive(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess],
  );

  const onUpdateCall = useCallback(
    (result) => {
      setLoadingEditDraft(false);
      if (result !== null) {
        setVisibleEditProcurement(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess],
  );

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        setLoadingRecive(true);
        dispatch(ConfirmPoProcumentAction(idNumber, value.id, value, onReciveProcumentCallback));
      }
    },
    [dispatch, idNumber, onReciveProcumentCallback, poData],
  );

  const onChangeFile = async (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file && info.file.status === "removed") {
      return;
    }
    refProgressModal.current?.openModal();
    const file = info.file;
    const dataExcel = await file?.originFileObj?.arrayBuffer();
    const workbook = XLSX.read(dataExcel);
    const workSheet = workbook.Sheets[workbook.SheetNames[0]];

    let jsonData: any = XLSX.utils.sheet_to_json(workSheet);
    // kiểm tra các trường tuyền vào chưa đúng
    const object: any = {};
    jsonData.forEach((item: any) => {
      const keyItem = Object.keys(item);
      keyItem.forEach((key) => {
        if (object[key]) {
          object[key] = [...object[key], item[key]];
        } else {
          object[key] = [item[key]];
        }
      });
    });
    const fieldExcel = Object.keys(object);
    const filedCheck = Object.values(ProcurementExportLineItemField);
    const error: Array<string> = [];
    fieldExcel.forEach((item) => {
      if (!filedCheck.includes(item)) error.push(`Trường ${item} không tồn tại trong file Excel`);
    });
    if (error.length) {
      return;
    }
    //xu lý ngày trùng
    const jsonDataFormat = jsonData.map((item: any) => {
      return {
        ...item,
        [ProcurementExportLineItemField[POExpectedDateField.ngay_nhan_du_kien]]: ConvertDateToUtc(
          moment(
            item[ProcurementExportLineItemField[POExpectedDateField.ngay_nhan_du_kien]],
            "DD/MM/YYYY",
          ).format("MM-DD-YYYY"),
        ),
      };
    });
    const objectCheckDate: any = {};
    jsonDataFormat.forEach((item: any) => {
      const keyItem = Object.keys(item);
      keyItem.forEach((key) => {
        if (objectCheckDate[key]) {
          objectCheckDate[key] = [...objectCheckDate[key], item[key]];
        } else {
          objectCheckDate[key] = [item[key]];
        }
      });
    });
  };

  const onCloseProgressModal = () => {
    refProgressModal.current?.closeModal();
  };

  useEffect(() => {
    if (visible === false) setDraft(null);
  }, [visible, poData, stores]);

  return (
    <>
      {procurementTableData.length > 0 ? (
        <StyledCard
          className="po-form margin-top-20"
          title={
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.receive_status] !== current[POField.receive_status]
              }
            >
              {({ getFieldValue }) => {
                let receive_status = getFieldValue(POField.receive_status);
                let statusName = "Chưa nhập kho";
                let className = "po-tag";
                let dotClassName = "icon-dot";
                if (receive_status === ProcumentStatus.PARTIAL_RECEIVED) {
                  statusName = "Nhập kho 1 phần";
                  className += " po-tag-warning";
                  dotClassName += " partial";
                }
                if (
                  receive_status === ProcumentStatus.CANCELLED ||
                  receive_status === ProcumentStatus.RECEIVED
                ) {
                  statusName = "Đã nhập kho";
                  className += " po-tag-success";
                  dotClassName += " success";
                }
                if (receive_status === ProcumentStatus.FINISHED) {
                  statusName = "Kết thúc nhập kho";
                  className += " po-tag-danger";
                  dotClassName += " danger";
                }
                if (status === ProcumentStatus.DRAFT) {
                  return (
                    <Space>
                      <div className="d-flex">
                        <span className="title-card">NHẬP KHO</span>
                      </div>{" "}
                    </Space>
                  );
                }

                return (
                  <Space>
                    {isShowStatusTag && <div className={dotClassName} style={{ fontSize: 8 }} />}
                    <div className="d-flex">
                      <span className="title-card">NHẬP KHO</span>
                    </div>{" "}
                    {isShowStatusTag && <Tag className={className}>{statusName}</Tag>}
                  </Space>
                );
              }}
            </Form.Item>
          }
          extra={
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.line_items] !== current[POField.line_items] ||
                prev[POField.expect_store_id] !== current[POField.expect_store_id] ||
                prev[POField.receive_status] !== current[POField.receive_status]
              }
            >
              {({ getFieldValue }) => {
                const expect_store_id: number = getFieldValue(POField.expect_store_id);
                const line_items: Array<PurchaseOrderLineItem> = getFieldValue(POField.line_items);
                const procurements: Array<PurchaseProcurementViewDraft> =
                  getFieldValue(POField.procurements) || [];

                if (
                  (status === POStatus.DRAFT || status === POStatus.WAITING_APPROVAL) &&
                  props.isEdit
                ) {
                  return (
                    <Button
                      onClick={() => {
                        setEditProcument(false);
                        setStoreExpect(expect_store_id);
                        setPOItem(line_items);
                        setVisibleEditProcurement(true);
                        setProcurements(procurements);
                      }}
                      style={{
                        alignItems: "center",
                        display: "flex",
                      }}
                      type="primary"
                      htmlType="button"
                      className="create-button-custom ant-btn-outline fixed-button"
                    >
                      Sửa kế hoạch nhập kho
                    </Button>
                  );
                } else {
                  return (
                    <div className="d-flex" style={{ display: "flex" }}>
                      {/* <Form.Item style={{ marginBottom: 0 }}> */}
                      {/* <Typography.Text strong>Link file excel mẫu: </Typography.Text> */}
                      {/* <Typography.Text>
                            <img src={excelIcon} alt="" />{" "}
                            <a
                              href="https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_6478e0de-e23b-46cb-b8b9-2a3c79e18083_original.xlsx"
                              download="Import_Procurement">
                              Link file excel mẫu(.xlsx)
                            </a>
                          </Typography.Text>
                        </Form.Item> */}
                      {/* <Form.Item
                          name={[ProcurementField.file]}
                          style={{ maxWidth: "145px", marginBottom: 0 }}>
                          <Upload
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            maxCount={1}
                            onChange={onChangeFile}
                            onRemove={(file) => {
                              const index = fileList.indexOf(file);
                              const newFileList = [...fileList]
                              newFileList.splice(index, 1);
                              return setFileList(newFileList)
                            }}
                            fileList={[]}
                            customRequest={(option: any) => {
                              return dispatch(uploadFileAction([option.file], "stock-transfer", onResultChange));
                            }}>
                            <Button style={{ margin: "0 12px" }} size="middle" icon={<UploadOutlined />}>
                              Nhập file
                            </Button>
                          </Upload>
                        </Form.Item> */}
                    </div>
                  );
                }
              }}
            </Form.Item>
          }
        >
          <POModelCreateFile visible={false} onCancel={() => {}} onEnter={() => {}} />

          <Form.Item hidden noStyle name={POField.receive_status}>
            <Input />
          </Form.Item>
          <div>
            {status === POStatus.DRAFT || status === POStatus.WAITING_APPROVAL ? (
              <PoPrTable form={formMain} />
            ) : (
              <POInventoryView
                form={formMain}
                tabs={TAB}
                activeTab={activeTab}
                selectTabChange={(id) => setActiveTab(id)}
                code={poData ? poData.code : undefined}
                id={idNumber}
                onSuccess={() => {
                  onAddProcumentSuccess && onAddProcumentSuccess(true);
                }}
                confirmDraft={(
                  value: PurchaseProcument,
                  isEdit: boolean,
                  procumentCode?: string,
                ) => {
                  setEditProcument(isEdit);
                  let line_items = formMain.getFieldValue(POField.line_items);
                  setPOItem(line_items);
                  if (isEdit) {
                    setVisible(true);
                    setDraft(value);
                  } else {
                    setProcumentDraft(value);
                    setVisibleDraft(true);
                  }
                  procumentCodeRef.current = procumentCode || "";
                }}
                confirmInventory={(
                  value: PurchaseProcument,
                  isEdit: boolean,
                  procumentCode?: string,
                ) => {
                  setEditProcument(isEdit);
                  let line_items = formMain.getFieldValue(POField.line_items);
                  setPOItem(line_items);
                  if (isEdit) {
                    setProcumentDraft(value);
                    setVisibleDraft(true);
                  } else {
                    setProcumentInventory(value);
                    setVisibleConfirm(true);
                  }
                  procumentCodeRef.current = procumentCode || "";
                }}
                isEditDetail={isEditDetail}
                receiveStatus={poData ? poData.receive_status : undefined}
              />
            )}
          </div>

          {visible && (
            <ProcumentModal
              onCancle={() => {
                setVisible(false);
              }}
              isEdit={isEditProcument}
              loading={loadingCreate}
              stores={stores}
              poData={poData}
              now={now}
              visible={visible}
              items={poItems}
              item={draft}
              defaultStore={storeExpect}
              onOk={(value: PurchaseProcument) => {
                onAddProcument(value);
                setActiveTab(TAB[3].id);
              }}
              onDelete={onDeleteProcument}
              procumentCode={procumentCodeRef.current}
            />
          )}
          {visibleDraft && (
            <ProcumentConfirmModal
              isEdit={isEditProcument}
              items={poItems}
              stores={stores}
              poData={poData}
              procumentCode={procumentCodeRef.current}
              now={now}
              visible={visibleDraft}
              item={procumentDraft}
              onOk={(value: PurchaseProcument) => {
                onConfirmProcument(value);
                setActiveTab(TAB[2].id);
              }}
              onDelete={onDeleteProcument}
              loading={loadingConfirm}
              defaultStore={storeExpect}
              onCancel={() => {
                setVisibleDraft(false);
              }}
            />
          )}
          {visibleConfirm && (
            <ProcumentInventoryModal
              loadDetail={loadDetail}
              isEdit={isEditProcument}
              items={poItems}
              stores={stores}
              now={now}
              visible={visibleConfirm}
              poData={poData}
              item={procumentInventory}
              onOk={(value: PurchaseProcument) => {
                onReciveProcument(value);
                setActiveTab(TAB[1].id);
              }}
              onDelete={onDeleteProcument}
              loading={loadingRecive}
              defaultStore={storeExpect}
              procumentCode={procumentCodeRef.current}
              onCancel={() => {
                setVisibleConfirm(false);
              }}
            />
          )}
          {visibleEditProcurement && (
            <POEditDraftProcurementModal
              stores={stores}
              visible={visibleEditProcurement}
              onCancel={() => setVisibleEditProcurement(false)}
              onOk={(value: Array<PurchaseProcurementViewDraft>) => {
                setLoadingEditDraft(true);
                let data = formMain.getFieldsValue(true);
                let dataClone = { ...data, procurements: value };
                if (idNumber) {
                  dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
                }
              }}
              lineItems={poItems}
              dataSource={procurements}
              confirmLoading={loadingEditDraft}
            />
          )}
          <YDProgressModal
            dataProcess={dataProgress}
            onOk={onCloseProgressModal}
            onCancel={onCloseProgressModal}
            ref={refProgressModal}
          />
        </StyledCard>
      ) : (
        <></>
      )}
    </>
  );
};

const StyledCard = styled(Card)`
  .ant-input,
  .ant-btn,
  .ant-picker,
  .ant-select:not(.ant-select-customize-input) .ant-select-selector,
  #store_id {
    height: 32px !important;
    display: flex;
    align-items: center;
  }
  .ant-select-selection-item,
  .ant-btn {
    display: flex;
    align-items: center;
  }
  .ant-table-thead > tr > th {
    border-right: 1px solid #f0f0f0;
  }
  .ant-table-cell {
    padding: 5px !important;
  }
  .ant-row.ant-form-item.store {
    margin-bottom: 0 !important;
  }
  .ant-row.ant-form-item.select-item {
    margin-bottom: 0;
  }
  .ant-select-selection-search {
    display: flex;
    align-items: center;
  }
`;

POInventoryFormCreate.defaultProps = {
  isShowStatusTag: true,
};

export default POInventoryFormCreate;
