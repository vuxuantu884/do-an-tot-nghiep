import React, {useCallback, useEffect, useState} from "react";
import {Button, Checkbox, Col, Divider, Modal, Progress, Radio, Row, Space, Tooltip} from "antd";
import {showError, showSuccess} from "utils/ToastUtils";

import {generateQuery} from "utils/AppUtils";
import {HttpStatus} from "config/http-status.config";
import {exportFile, getFile} from "service/other/export.service";

import {ExportCustomerModalStyled} from "screens/customer/export-file/ExportCustomerStyled";
import _ from "lodash";

type ExportCustomerFileType = {
  cancelExportModal: () => void;
  isVisibleExportModal: boolean;
  customerData: any;
  params: any;
};


const ExportCustomerFile: React.FC<ExportCustomerFileType> = (
  props: ExportCustomerFileType
) => {
  const { cancelExportModal, isVisibleExportModal, customerData, params } = props;

  // handle export file
  const [exportPageAll, setExportPageAll] = useState(true);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [exportColumnAll, setExportColumnAll] = useState(true);
  const [exportCodeList, setExportCodeList] = useState<Array<any>>([]);
  const [exportItemNumber, setExportItemNumber] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isVisibleExportWarningModal, setIsVisibleExportWarningModal] = useState(false);
  
  const onChangeExportPageOption = (e: any) => {
    setExportPageAll(e.target.value);
  };

  const onChangeExportColumnOption = (e: any) => {
    setExportColumnAll(e.target.value);
  };

  const okExportModal = () => {
    let newParams = {...params};
    newParams.search_type = undefined;  //remove search_type param
    if (exportPageAll) {
      newParams.limit = customerData?.metadata?.total;
      newParams.page = undefined;
    }

    // Chặn xuất file nếu lớn hơn 40.000 bản ghi
    if (newParams.limit > 40000) {
      setIsVisibleExportWarningModal(true);
    } else {
      setExportItemNumber(newParams.limit);
      setIsExporting(true);
      const exportParams = generateQuery(newParams);

      const defaultHiddenFields = "total_finished_order,remain_amount_to_level_up,average_order_value,total_returned_order,total_refunded_amount,number_of_days_without_purchase,description";
      let hiddenFields;
      if (exportColumnAll) {
        hiddenFields = defaultHiddenFields;
      } else {
        const notSelectColumnList = columnListOption.filter((item: any) => item.isSelected === false);
        hiddenFields = defaultHiddenFields + "," + notSelectColumnList.map((column: any) => column.value)?.toString();
      }

      exportFile({
        conditions: exportParams,
        hidden_fields: hiddenFields,
        type: "EXPORT_CUSTOMER",
      })
        .then((response) => {
          setIsExporting(false);
          if (response.code === HttpStatus.SUCCESS) {
            setIsVisibleProgressModal(true);
            handleCancelExportModal();
            setExportCodeList([...exportCodeList, response.data.code]);
          } else {
            showError(`${response.message ? response.message : "Có lỗi xảy ra, vui lòng thử lại sau"}`);
          }
        })
        .catch(() => {
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
          setIsExporting(false);
        });
    }
  };

  const onOkExportModal = () => {
    resetProgress();
    okExportModal();
  };

  const handleCancelExportModal = () => {
    cancelExportModal();
    setExportPageAll(true);
  };

  // process export modal
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const resetProgress = () => {
    setExportProgress(0);
    setExportCodeList([]);
    setExportItemNumber(0);
  }

  const onCancelProgressModal = useCallback(() => {
    resetProgress();
    setExportPageAll(true);
    setIsVisibleProgressModal(false);
  }, []);

  const checkExportFile = useCallback(() => {
    let getFilePromises = exportCodeList.map((code) => {
      return getFile(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (isVisibleProgressModal && response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "PROCESSING") {
            const exportPercent = Number(response?.data?.percent);
            setExportProgress(exportPercent < 100 ? exportPercent : 99);
          } else if (response.data && response.data.status === "FINISH") {
            if (response.data.url) {
              const newExportCode = exportCodeList.filter((item) => {
                return item !== response.data.code;
              });
              setExportCodeList(newExportCode);
              setExportProgress(100);
              showSuccess("Xuất file dữ liệu khách hàng thành công!");
              window.open(response.data.url);
            }
          } else if (response.data && response.data.status === "ERROR") {
            onCancelProgressModal();
            showError("Xuất file dữ liệu khách hàng thất bại!");
          }
        }
      });
    });
  }, [exportCodeList, isVisibleProgressModal, onCancelProgressModal]);

  useEffect(() => {
    if (exportProgress === 100 || exportCodeList.length === 0) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, exportItemNumber > 1000 ? 3000 : 2000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkExportFile, exportCodeList, exportItemNumber]);
  // end handle export file

  //handle select column export
  const columnListOptionDefault = [
    {name: "Mã khách hàng", value: "code", isSelected: false},
    {name: "Tên khách hàng", value: "full_name", isSelected: false},
    {name: "Số điện thoại", value: "phone", isSelected: false},
    {name: "Giới tính", value: "gender", isSelected: false},
    {name: "Nhóm khách hàng", value: "customer_group", isSelected: false},
    {name: "Email", value: "email", isSelected: false},
    {name: "Loại khách hàng", value: "customer_type", isSelected: false},
    {name: "Nhân viên phụ trách", value: "responsible_staff", isSelected: false},
    {name: "Hạng thẻ", value: "customer_level", isSelected: false},
    {name: "Ngày sinh", value: "birthday", isSelected: false},
    {name: "Ngày cưới", value: "wedding_date", isSelected: false},
    {name: "Website/Facebook", value: "website", isSelected: false},
    {name: "Ngày kích hoạt thẻ", value: "assigned_date", isSelected: false},
    {name: "Cửa hàng kích hoạt", value: "assigned_store", isSelected: false},
    {name: "Mã số thẻ", value: "card_number", isSelected: false},
    {name: "Đơn vị", value: "company", isSelected: false},
    {name: "Điểm hiện tại", value: "point", isSelected: false},
    {name: "Tiền tích lũy", value: "total_paid_amount", isSelected: false},
    {name: "Ngày mua đầu", value: "first_order_time", isSelected: false},
    {name: "Ngày mua đầu (online)", value: "first_order_time_online", isSelected: false},
    {name: "Ngày mua đầu (offline)", value: "first_order_time_offline", isSelected: false},
    {name: "Ngày mua cuối", value: "last_order_time", isSelected: false},
    {name: "Ngày mua cuối (online)", value: "last_order_time_online", isSelected: false},
    {name: "Ngày mua cuối (offline)", value: "last_order_time_offline", isSelected: false},
    {name: "Cửa hàng mua đầu", value: "store_of_first_order_offline", isSelected: false, tooltip: "Cửa hàng mua offline đầu của KH"},
    {name: "Cửa hàng mua cuối", value: "store_of_last_order_offline", isSelected: false, tooltip: "Cửa hàng mua offline cuối của KH"},
    {name: "Nguồn mua đầu", value: "source_of_first_order_online", isSelected: false, tooltip: "Nguồn mua online đầu của KH"},
    {name: "Nơi mua đầu", value: "first_order_place", isSelected: false, tooltip: "Cửa hàng mua offline hoặc Nguồn mua online đầu của KH"},
    {name: "Nơi mua cuối", value: "last_order_place", isSelected: false, tooltip: "Cửa hàng mua offline hoặc Nguồn mua online cuối của KH"},
    {name: "Nguồn mua cuối", value: "source_of_last_order_online", isSelected: false, tooltip: "Nguồn mua online cuối của KH"},
    {name: "Loại mua đầu", value: "first_order_type", isSelected: false, tooltip: "Loại mua đầu: online hoặc offline"},
    {name: "Loại mua cuối", value: "last_order_type", isSelected: false, tooltip: "Loại mua cuối: online hoặc offline"},
    {name: "Tỉnh/Thành phố", value: "city", isSelected: false},
    {name: "Quận/Huyện", value: "district", isSelected: false},
    {name: "Xã/Phường", value: "ward", isSelected: false},
    {name: "Địa chỉ", value: "full_address", isSelected: false},
  ];

  const [columnListOption, setColumnListOption] = useState<any>(columnListOptionDefault);
  const [columnSelectedList, setColumnSelectedList] = useState<Array<string>>([]);

  const onSelectAllColumn = (e: any) => {
    let columnListOptionClone = _.cloneDeep(columnListOption)
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
    let newColumnListOption = _.cloneDeep(columnListOption)
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
  //end handle select column export


  return (
    <div>
      {/* Export customer data */}
      {isVisibleExportModal &&
        <Modal
          width="600px"
          visible={isVisibleExportModal}
          title="Xuất excel dữ liệu khách hàng"
          okText="Xuất dữ liệu"
          cancelText="Đóng"
          onCancel={handleCancelExportModal}
          onOk={onOkExportModal}
          okButtonProps={{
            disabled: (!exportColumnAll && !columnSelectedList.length),
            loading: isExporting
          }}
          maskClosable={false}>
          <ExportCustomerModalStyled>
            <div className="export-customer-modal">
              <div>
                <i><strong>Lưu ý:</strong> Vui lòng xuất dữ liệu dưới <strong>40.000</strong> bản ghi để đảm bảo quá trình xuất dữ liệu thành công.</i>
              </div>
              <Divider style={{margin: "10px 0"}} />

              <div>
                <div><strong>Chọn trang</strong></div>
                <Radio.Group onChange={onChangeExportPageOption} value={exportPageAll} className="radio-group">
                  <Space className="radio-option">
                    <Radio value={true} key="all-page">Tất cả các trang</Radio>
                    <Radio value={false} key="current-page">Trang hiện tại</Radio>
                  </Space>
                </Radio.Group>
              </div>

              <div style={{ marginTop: 20 }}>
                <div><strong>Chọn cột</strong></div>
                <Radio.Group onChange={onChangeExportColumnOption} value={exportColumnAll} className="radio-group">
                  <Space className="radio-option">
                    <Radio value={true} key="all-column">Tất cả các cột</Radio>
                    <Radio value={false} key="all-column">Tùy chọn cột</Radio>
                  </Space>
                </Radio.Group>
              </div>

              {!exportColumnAll &&
                <Row style={{ marginTop: 20 }}>
                  <Col key="all" span={24} style={{ marginBottom: 10 }}>
                    <Checkbox
                      checked={isSelectAll}
                      indeterminate={indeterminate}
                      onChange={(e) => onSelectAllColumn(e)}
                    >
                      Chọn tất cả
                    </Checkbox>
                  </Col>

                  {columnListOption?.map((column: any, index: number) => (
                    <Col key={column.value} span={8} style={{ marginBottom: 10 }}>
                      {column.tooltip ?
                        <Tooltip title={column.tooltip} color={"blue"}>
                          <Checkbox
                            onChange={(e) => onChangeColumnSelect(e, column, index)}
                            checked={column.isSelected}>
                            {column.name}
                          </Checkbox>
                        </Tooltip>
                        :
                        <Checkbox
                          onChange={(e) => onChangeColumnSelect(e, column, index)}
                          checked={column.isSelected}>
                          {column.name}
                        </Checkbox>
                      }
                    </Col>
                  ))}
                </Row>
              }
            </div>
          </ExportCustomerModalStyled>
        </Modal>
      }

      {isVisibleExportWarningModal &&
        <Modal
          width="600px"
          visible={isVisibleExportWarningModal}
          title="Cảnh báo xuất dữ liệu khách hàng"
          okText=""
          cancelText=""
          onCancel={() => setIsVisibleExportWarningModal(false)}
          maskClosable={false}
          footer={[
            <Button type="primary" onClick={() => setIsVisibleExportWarningModal(false)}>
              Đồng ý
            </Button>
          ]}>
          <div>
            <div>Số lượng khách hàng vượt quá <b>40.000</b> bản ghi sẽ ảnh hưởng đến quá trình xuất dữ liệu khách hàng trên Unicorn.</div>
            <div>Bạn vui lòng sử dụng bộ lọc để tách nhỏ file dữ liệu hiện tại.</div>
          </div>
        </Modal>
      }

      {/* Progress export customer data */}
      {isVisibleProgressModal &&
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file"
          centered
          width={600}
          maskClosable={false}
          footer={[
            <>
              {exportProgress < 100 ?
                <Button key="cancel-process-modal" danger onClick={onCancelProgressModal}>
                  Thoát
                </Button>
                :
                <Button key="confirm-process-modal" type="primary" onClick={onCancelProgressModal}>
                  Xác nhận
                </Button>
              }
            </>
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              {exportProgress < 100 ?
                <span>Đang tạo file, vui lòng đợi trong giây lát...</span>
                :
                <span style={{ color: "#27AE60" }}>Đã xuất file dữ liệu khách hàng thành công!</span>
              }
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </div>
        </Modal>
      }
    </div>
  );
};

export default ExportCustomerFile;
