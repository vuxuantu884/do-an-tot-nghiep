import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Checkbox, Col, Modal, Radio, Row, Space, Tooltip, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { importCustomerAction } from "domain/actions/customer/customer.action";
import excelIcon from "assets/icon/icon-excel.svg";
import { isNullOrUndefined } from "utils/AppUtils";
import { HttpStatus } from "config/http-status.config";
import BaseResponse from "base/base.response";
import { getProgressImportCustomerApi } from "service/customer/customer.service";
import { EnumJobStatus } from "config/enum.config";
import ProgressImportCustomerModal from "screens/customer/import-file/ProgressImportCustomerModal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { ImportCustomerQuery } from "model/query/customer.query";
import _ from "lodash";

type ImportCustomerFileType = {
  onCancel: () => void;
  onOk: () => void;
};

const exampleCustomerFile =
  "https://yody-prd-media.s3.ap-southeast-1.amazonaws.com/files/customer-import/template-import.xlsx";
const mappingInfoCustomer =
  "https://yody-prd-media.s3.ap-southeast-1.amazonaws.com/files/customer-import/template-mapping.xlsx";

const ImportCustomerFile: React.FC<ImportCustomerFileType> = (props: ImportCustomerFileType) => {
  const { onOk, onCancel } = props;

  const dispatch = useDispatch();

  const [isVisibleImportModal, setIsVisibleImportModal] = useState(true);
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [importProgressPercent, setImportProgressPercent] = useState<number>(0);
  const [processCode, setProcessCode] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isVisibleExitImportCustomerModal, setIsVisibleExitImportCustomerModal] =
    useState<boolean>(false);

  const columnListOptionDefault = [
    { name: "Tên khách hàng", value: "full_name", isSelected: false },
    { name: "Giới tính", value: "gender", isSelected: false },
    { name: "Email", value: "email", isSelected: false },
    { name: "Tỉnh/Thành phố", value: "city", isSelected: false },
    { name: "Quận/Huyện", value: "district", isSelected: false },
    { name: "Xã/Phường", value: "ward", isSelected: false },
    { name: "Địa chỉ", value: "full_address", isSelected: false },
    { name: "Thẻ khách hàng", value: "card_number", isSelected: false },
    { name: "Mã số thuế", value: "tax_code", isSelected: false },
    { name: "Ngày sinh", value: "birthday", isSelected: false },
    { name: "Ngày cưới", value: "wedding_date", isSelected: false },
    { name: "Nhóm khách hàng", value: "customer_group", isSelected: false },
    { name: "Loại khách hàng", value: "customer_type", isSelected: false },
    {
      name: "Nhân viên phụ trách",
      value: "responsible_staff",
      isSelected: false,
    },
    { name: "Website/Facebook", value: "website", isSelected: false },
    { name: "Đơn vị", value: "company", isSelected: false },
    { name: "Mô tả", value: "description", isSelected: false },
  ];

  //create + update customer by field options
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [isShowOptionInfoCustomer, setIsShowOptionInfoCustomer] = useState(false);
  const [isInsertIfBlank, setIsInsertIfBlank] = useState(false);
  const [columnListOption, setColumnListOption] = useState<any>(columnListOptionDefault);
  const [columnSelectedList, setColumnSelectedList] = useState<Array<string>>([]);

  const handleUpdateInfoCustomer = () => {
    setIsShowOptionInfoCustomer(false);
    setIsInsertIfBlank(false);
  };

  const handleUpdateOverwriteInfoCustomer = () => {
    setIsShowOptionInfoCustomer(false);
    setIsInsertIfBlank(true);
  };

  const handleUpdateOptionsInfoCustomer = () => {
    setIsShowOptionInfoCustomer(true);
    setIsInsertIfBlank(true);
  };

  // upload customer file
  const beforeUploadFile = useCallback((file) => {
    const isExcelFile =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcelFile) {
      showWarning("Vui lòng chọn đúng định dạng file excel .xlsx .xls");
      return Upload.LIST_IGNORE;
    } else {
      setFileList([file]);
      return false;
    }
  }, []);

  const onRemoveFile = (file: any) => {
    setFileList([]);
  };

  const callbackImportCustomer = (response: any) => {
    setIsVisibleImportModal(false);
    if (!!response) {
      setProcessCode(response.code);
      setIsVisibleProgressModal(true);
      setIsDownloading(true);
    } else {
      onCancel && onCancel();
    }
  };

  const onOkImportModal = () => {
    if (fileList?.length) {
      if (isShowOptionInfoCustomer && columnSelectedList.length <= 0) {
        showError("Vui lòng chọn ít nhất một cột");
        return;
      }
      const queryParams: ImportCustomerQuery = {
        file: fileList[0],
        insertIfBlank: isInsertIfBlank,
        fields: columnSelectedList?.length > 0 ? columnSelectedList : undefined,
      };
      dispatch(importCustomerAction(queryParams, callbackImportCustomer));
    } else {
      showWarning("Vui lòng chọn file!");
    }
  };

  const onCancelImportModal = () => {
    setIsVisibleImportModal(false);
    onCancel && onCancel();
  };

  const resetProgress = () => {
    setProcessCode(null);
    setImportProgressPercent(0);
    setProgressData(null);
  };

  const getProgressImportFile = useCallback(() => {
    let getImportProgressPromise: Promise<BaseResponse<any>> =
      getProgressImportCustomerApi(processCode);

    Promise.all([getImportProgressPromise]).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          !isNullOrUndefined(response.data.total)
        ) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount = processData.processed;
          if (progressCount >= processData.total || processData.status === EnumJobStatus.finish) {
            setImportProgressPercent(100);
            setProcessCode(null);
            setIsDownloading(false);
            showSuccess("Tải file lên thành công!");
            // lỗi api
            // if (!processData.api_error){
            //   showSuccess("Tải file lên thành công!");
            // } else {
            //   resetProgress();
            //   setIsVisibleProgressModal(false);
            //   showError(processData.api_error);
            // }
          } else {
            const percent = Math.floor((progressCount / processData.total) * 100);
            setImportProgressPercent(percent);
          }
        }
      });
    });
  }, [processCode]);

  useEffect(() => {
    if (importProgressPercent === 100 || !processCode) {
      return;
    }
    getProgressImportFile();
    const getFileInterval = setInterval(getProgressImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [getProgressImportFile, importProgressPercent, processCode]);

  const onOKProgressImportCustomer = () => {
    resetProgress();
    setIsVisibleProgressModal(false);
    onOk && onOk();
  };

  const onCancelProgressImportCustomer = () => {
    setIsVisibleExitImportCustomerModal(true);
  };

  const onCancelExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
  };

  const onOkExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
    onOKProgressImportCustomer();
    // gọi api hủy tải file lên
    // dispatch(
    //   exitProgressImportCustomerAction(processCode, (responseData) => {
    //     if (responseData) {
    //       showSuccess(responseData);
    //       setIsVisibleExitImportCustomerModal(false);
    //       onOKProgressImportCustomer();
    //     }
    //   })
    // );
  };

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);

  const onSelectAllColumn = (e: any) => {
    let columnListOptionClone = _.cloneDeep(columnListOption);
    let newColumnSelectedList: Array<any> = [];
    columnListOptionClone.forEach((column: any) => {
      column.isSelected = e.target?.checked;
      if (e.target?.checked) {
        newColumnSelectedList.push(column.value);
      }
    });
    setColumnListOption(columnListOptionClone);
    setColumnSelectedList(newColumnSelectedList);

    setIsSelectAll(e.target.checked);
    setIndeterminate(false);
  };

  const onChangeColumnSelect = (e: any, column: any, index: number) => {
    let newColumnListOption = _.cloneDeep(columnListOption);
    if (newColumnListOption && newColumnListOption[index]) {
      newColumnListOption[index].isSelected = e.target?.checked;
    }
    setColumnListOption(newColumnListOption);

    let newColumnSelectedList: any;
    if (e.target.checked) {
      newColumnSelectedList = _.cloneDeep(columnSelectedList);
      newColumnSelectedList.push(column.value);
      setColumnSelectedList(newColumnSelectedList);
    } else {
      newColumnSelectedList = columnSelectedList?.filter((columnSelected: any) => {
        return columnSelected !== column.value;
      });
      setColumnSelectedList(newColumnSelectedList);
    }

    if (newColumnSelectedList?.length === columnListOption.length) {
      setIsSelectAll(true);
      setIndeterminate(false);
    } else if (newColumnSelectedList?.length === 0) {
      setIsSelectAll(false);
      setIndeterminate(false);
    } else {
      setIndeterminate(true);
      setIsSelectAll(true);
    }
  };
  // end upload customer file

  return (
    <div>
      <Modal
        width="600px"
        centered
        visible={isVisibleImportModal}
        title="Nhập file"
        maskClosable={false}
        okText="Tải file lên"
        cancelText="Hủy"
        onOk={onOkImportModal}
        okButtonProps={{ disabled: checkDisableOkButton() }}
        onCancel={onCancelImportModal}
      >
        <div>
          <Typography.Text>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <a href={exampleCustomerFile} download="Import_Transfer">
                <img src={excelIcon} alt="" style={{ paddingRight: 4 }} /> file import khách hàng
                mẫu (.xlsx)
              </a>
              <a href={mappingInfoCustomer} download="Import_Transfer">
                <img src={excelIcon} alt="" style={{ paddingRight: 4 }} />
                file mapping thông tin khách hàng (.xlsx)
              </a>
            </div>
          </Typography.Text>
          <div style={{ marginTop: "20px", marginBottom: "5px" }}>
            <b>Tải file lên</b>
          </div>
          <Upload
            beforeUpload={beforeUploadFile}
            onRemove={onRemoveFile}
            maxCount={1}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>

          <Radio.Group defaultValue={1} style={{ marginTop: 20 }}>
            <Space direction="vertical">
              <Radio value={1} onClick={handleUpdateInfoCustomer}>
                Tạo thông tin KH mới + Cập nhật thông tin KH cũ:{" "}
                <b>
                  Chỉ cập nhật thông tin những trường trống, những trường đã có thông tin thì giữ
                  nguyên thông tin cũ của KH
                </b>
              </Radio>
              <Radio
                value={2}
                style={{ marginTop: 10 }}
                onClick={handleUpdateOverwriteInfoCustomer}
              >
                Tạo thông tin KH mới + Cập nhật thông tin KH cũ:{" "}
                <b>Cập nhật toàn bộ thông tin mới chèn lên thông tin cũ của KH</b>
              </Radio>
              <Radio value={3} style={{ marginTop: 10 }} onClick={handleUpdateOptionsInfoCustomer}>
                Tạo thông tin KH mới + <b>Cập nhập cột thông tin khách hàng tùy chọn</b>
              </Radio>
            </Space>
          </Radio.Group>

          {isShowOptionInfoCustomer && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: "bold" }}>Chọn cột</div>
              <Row style={{ marginTop: 10 }}>
                <Col key="all" span={24} style={{ marginBottom: 10 }}>
                  <Checkbox
                    checked={isSelectAll}
                    indeterminate={indeterminate}
                    onChange={(e) => onSelectAllColumn(e)}
                  >
                    <span style={{ fontWeight: 500 }}>Chọn tất cả</span>
                  </Checkbox>
                </Col>

                {columnListOption?.map((column: any, index: number) => (
                  <Col key={column.value} span={8} style={{ marginBottom: 10 }}>
                    {column.tooltip ? (
                      <Tooltip title={column.tooltip} color={"blue"}>
                        <Checkbox
                          onChange={(e) => onChangeColumnSelect(e, column, index)}
                          checked={column.isSelected}
                        >
                          {column.name}
                        </Checkbox>
                      </Tooltip>
                    ) : (
                      <Checkbox
                        onChange={(e) => onChangeColumnSelect(e, column, index)}
                        checked={column.isSelected}
                      >
                        {column.name}
                      </Checkbox>
                    )}
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </Modal>

      {isVisibleProgressModal && (
        <ProgressImportCustomerModal
          visible={isVisibleProgressModal}
          onCancel={onCancelProgressImportCustomer}
          onOk={onOKProgressImportCustomer}
          progressData={progressData}
          progressPercent={importProgressPercent}
          isDownloading={isDownloading}
        />
      )}

      {isVisibleExitImportCustomerModal && (
        <Modal
          width="600px"
          centered
          visible={isVisibleExitImportCustomerModal}
          title=""
          maskClosable={false}
          onCancel={onCancelExitImportCustomerModal}
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={onOkExitImportCustomerModal}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>
                Bạn có chắc chắn muốn hủy tải file lên không?
              </strong>
              <div style={{ fontSize: 14 }}>
                Hệ thống sẽ dừng việc tải file khách hàng lên. <br /> Các khách hàng đã tải thành
                công sẽ được thêm vào danh sách khách hàng"
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImportCustomerFile;
