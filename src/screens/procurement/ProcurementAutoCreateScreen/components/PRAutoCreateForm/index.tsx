import {
  CheckCircleOutlined,
  LoadingOutlined,
  PhoneOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import Text from "antd/lib/typography/Text";
import { UploadFile } from "antd/lib/upload/interface";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { EnumImportStatus } from "config/enum.config";
import UrlConfig from "config/url.config";
import { uploadFileAction } from "domain/actions/core/import.action";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { debounce, isEmpty } from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { VscError } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SupplierItem from "screens/purchase-order/component/supplier-item";
import { getAccountDetail } from "service/accounts/account.service";
import { callApiNative } from "utils/ApiUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import {
  checkStoresEnvironment,
  EnumImportStep,
  POProcurementField,
} from "screens/procurement/helper";

type ProcurementFormProps = {
  formMain: FormInstance;
  procurementsResult: Array<PurchaseProcument>;
  setLinkFileImport: (file: string) => void;
  linkFileImport?: string;
  setStatusImport: (step: number) => void;
  statusImport: number;
  uploadStatus?: UploadStatus;
  setUploadStatus: (status: UploadStatus) => void;
  setErrorMessage: (errs: string[]) => void;
  errorMessage: string[];
  isShowModal: boolean;
  setIsShowModal: (modal: boolean) => void;
  setFileList: (file: any) => void;
  fileList: Array<UploadFile>;
};

type UploadStatus = "ERROR" | "SUCCESS" | "DONE" | "PROCESSING" | "REMOVED" | undefined;

const PRAutoCreateForm: React.FC<ProcurementFormProps> = (props: ProcurementFormProps) => {
  const {
    formMain,
    procurementsResult,
    setLinkFileImport,
    setStatusImport,
    statusImport,
    uploadStatus,
    setUploadStatus,
    errorMessage,
    setErrorMessage,
    isShowModal,
    setIsShowModal,
    fileList,
    setFileList,
  } = props;
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [accountStores, setAccountStores] = useState<Array<AccountStoreResponse>>([]);

  const dispatch = useDispatch();

  const getMe = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getAccountDetail);
    if (res && res.account_stores) {
      setAccountStores(res.account_stores);
    }
  }, [dispatch]);

  useEffect(() => {
    const stores: Array<Pick<AccountStoreResponse, "store_id" | "store">> =
      checkStoresEnvironment();

    if (accountStores?.length === 1) {
      stores.forEach((element) => {
        if (element.store_id === accountStores[0].store_id) {
          formMain.setFieldsValue({ [POProcurementField.store_id]: accountStores[0].store_id });
        }
      });
    }

    if (accountStores?.length === 0) {
      setAccountStores(stores);
    }
  }, [accountStores, formMain]);

  useEffect(() => {
    getMe();
  }, [dispatch, getMe]);

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse) => {
      options.push({
        label: <SupplierItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });

    return options;
  }, [data]);

  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setIsLoadingSearch(false);
    setData(result.items);
  }, []);

  const debouncedSearchSupplier = useMemo(
    () =>
      debounce((keyword: string) => {
        setIsLoadingSearch(true);
        dispatch(SupplierSearchAction({ condition: keyword.trim(), status: "active" }, onResult));
      }, 300),
    [dispatch, onResult],
  );

  const onChangeKeySearchSupplier = (keyword: string) => {
    debouncedSearchSupplier(keyword);
  };

  const removeSupplier = () => {
    formMain.setFieldsValue({
      [POProcurementField.supplier_id]: undefined,
      [POProcurementField.supplier]: null,
      [POProcurementField.supplier_phone]: null,
    });
  };

  const onSelect = (value: string) => {
    const index = data.findIndex((item) => item.id === +value);
    const supplier = data[index];

    formMain.setFieldsValue({
      [POProcurementField.supplier_id]: value,
      [POProcurementField.supplier]: data[index].name,
      [POProcurementField.supplier_phone]: supplier.phone,
    });
  };

  const onChangeStore = useCallback(
    (value: any) => {
      formMain.setFieldsValue({ [POProcurementField.store_id]: value });
    },
    [formMain],
  );

  const onChangeFile = useCallback(
    (info: any) => {
      if (info.file.status !== "removed") {
        setFileList([info.file]);
      }
    },
    [setFileList],
  );

  const onResultChange = useCallback(
    (res) => {
      if (res) {
        fileList[0] = { ...fileList[0], status: "done", url: res[0] };
        setFileList([...fileList]);
        setLinkFileImport(res[0]);
        setStatusImport(EnumImportStep.CREATE_JOB_SUCCESS);
      }
    },
    [fileList, setFileList, setLinkFileImport, setStatusImport],
  );

  return (
    <Row gutter={50}>
      <Col span={16}>
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues[POProcurementField.supplier_id] !==
                curValues[POProcurementField.supplier_id]
              }
              className="margin-bottom-0"
            >
              {({ getFieldValue }) => {
                const supplierId = getFieldValue([POProcurementField.supplier_id]);
                const supplier = getFieldValue([POProcurementField.supplier]);
                const phone = getFieldValue([POProcurementField.supplier_phone]);
                return (
                  <>
                    {supplierId ? (
                      <div style={{ marginBottom: 15 }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Link
                            to={`${UrlConfig.SUPPLIERS}/${supplierId}`}
                            className="primary"
                            target="_blank"
                            style={{ fontSize: "16px", marginRight: 10 }}
                          >
                            {supplier}
                          </Link>
                          {isEmpty(procurementsResult) && supplierId && (
                            <Button
                              type="link"
                              onClick={removeSupplier}
                              style={{ display: "flex", alignItems: "center" }}
                              icon={<AiOutlineClose />}
                            />
                          )}
                        </div>
                        <>
                          <Form.Item hidden name={[POProcurementField.supplier_id]}>
                            <Input />
                          </Form.Item>
                          <Form.Item hidden name={[POProcurementField.supplier]}>
                            <Input />
                          </Form.Item>
                          <Form.Item hidden name={[POProcurementField.supplier_phone]}>
                            <Input />
                          </Form.Item>
                          <Row>
                            <div>
                              <PhoneOutlined />{" "}
                              <Text strong>
                                {phone.indexOf("{") !== -1
                                  ? `+${JSON.parse(phone).code}${JSON.parse(phone).phone}`
                                  : phone}
                              </Text>
                            </div>
                          </Row>
                        </>
                      </div>
                    ) : (
                      <>
                        <Text strong>Chọn nhà cung cấp</Text>
                        <span style={{ color: "red" }}> *</span>
                        <Form.Item
                          name={[POProcurementField.supplier_id]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn nhà cung cấp",
                            },
                          ]}
                        >
                          <CustomAutoComplete
                            loading={isLoadingSearch}
                            dropdownClassName="supplier"
                            placeholder="Tìm kiếm nhà cung cấp"
                            onSearch={onChangeKeySearchSupplier}
                            dropdownMatchSelectWidth={456}
                            style={{ width: "100%" }}
                            onSelect={(value) => {
                              if (!value) return;
                              onSelect(value);
                            }}
                            options={renderResult}
                          />
                        </Form.Item>
                      </>
                    )}
                  </>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Text strong>Chọn kho nhận </Text>
            <span style={{ color: "red" }}>*</span>
            <Form.Item
              name={[POProcurementField.store_id]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kho nhận hàng",
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                showArrow
                optionFilterProp="children"
                placeholder="Chọn kho nhận"
                onChange={onChangeStore}
                disabled={!isEmpty(procurementsResult)}
              >
                {!isEmpty(accountStores) &&
                  accountStores.map((item) => (
                    <Select.Option key={item.id} value={item.store_id || 0}>
                      {item.store}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={8}>
            <Form.Item
              name={[POProcurementField.file]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập file",
                },
              ]}
            >
              <Upload
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                maxCount={1}
                fileList={fileList}
                onChange={onChangeFile}
                onRemove={(file) => {
                  const index = fileList.indexOf(file);
                  const newFileList = [...fileList];
                  newFileList.splice(index, 1);
                  return setFileList(newFileList);
                }}
                customRequest={(option: any) => {
                  return dispatch(
                    uploadFileAction([option.file], "stock-transfer", onResultChange),
                  );
                }}
              >
                <Button
                  disabled={!isEmpty(procurementsResult)}
                  size="middle"
                  icon={<UploadOutlined />}
                >
                  Nhập file sản phẩm <span style={{ color: "red", marginLeft: 3 }}>*</span>
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item style={{ paddingTop: 10 }}>
              <Typography.Text strong>Link file excel mẫu: </Typography.Text>
              <Typography.Text>
                <img src={excelIcon} alt="" />{" "}
                <a
                  href="https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/M%C3%A2%CC%83u_file_nh%C3%A2%CC%A3p_kho_ncc.xlsx"
                  download="Import_Procurement"
                >
                  Mẫu file nhập kho NCC(.xlsx)
                </a>
              </Typography.Text>
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={8}>
        <Text strong>Ghi chú </Text>
        <Form.Item name={[POProcurementField.note]}>
          <Input.TextArea
            rows={4}
            maxLength={500}
            placeholder="Nhập ghi chú"
            disabled={!isEmpty(procurementsResult)}
          />
        </Form.Item>
      </Col>

      <Modal
        visible={isShowModal}
        title="Tạo phiếu"
        onCancel={() => {
          setUploadStatus(undefined);
          setStatusImport(EnumImportStep.CHANGE_FILE);
          setIsShowModal(false);
          setErrorMessage([]);
        }}
        footer={[
          <>
            {(statusImport === EnumImportStep.JOB_FINISH ||
              statusImport === EnumImportStep.ERROR) && (
              <Button
                key="link"
                type="primary"
                onClick={() => {
                  setUploadStatus(undefined);
                  setStatusImport(EnumImportStep.CHANGE_FILE);
                  setIsShowModal(false);
                  setErrorMessage([]);
                }}
              >
                Ok
              </Button>
            )}
          </>,
        ]}
      >
        <div>
          <Row justify={"center"}>
            {uploadStatus === EnumImportStatus.processing ? (
              <Col span={24}>
                <Row justify={"center"}>
                  <LoadingOutlined style={{ fontSize: "78px", color: "#E24343" }} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{ padding: "10px 30px" }}>Đang xử lý nhập file...</h2>
                </Row>
              </Col>
            ) : (
              ""
            )}
            {uploadStatus === EnumImportStatus.error ? (
              <Col span={24}>
                <Row justify={"center"}>
                  <VscError style={{ fontSize: "78px", color: "#E24343" }} />
                </Row>
                <Row justify={"center"}>
                  <ul style={{ marginTop: 10, marginBottom: 0, color: "#E24343" }}>
                    {errorMessage.length === 0 ? (
                      <li>Máy chủ đang bận</li>
                    ) : (
                      errorMessage.map((el: string) => <li>{el}</li>)
                    )}
                  </ul>
                </Row>
              </Col>
            ) : (
              ""
            )}
            {uploadStatus === EnumImportStatus.done ||
            uploadStatus === EnumImportStatus.success ||
            uploadStatus === EnumImportStatus.error ? (
              <Col span={24}>
                {uploadStatus === EnumImportStatus.success && (
                  <>
                    <Row justify={"center"}>
                      <CheckCircleOutlined style={{ fontSize: "78px", color: "#27AE60" }} />
                    </Row>
                    <Row justify={"center"}>
                      <h2 style={{ padding: "10px 30px" }}>
                        Xử lý nhập hoàn tất: <strong style={{ color: "#2A2A86" }} />{" "}
                      </h2>
                      <h4>
                        <ul>
                          {errorMessage.length > 0 &&
                            errorMessage.map((el: string) => <li>{el}</li>)}
                        </ul>
                      </h4>
                    </Row>
                  </>
                )}
              </Col>
            ) : (
              ""
            )}
          </Row>
        </div>
      </Modal>
    </Row>
  );
};

export default PRAutoCreateForm;
