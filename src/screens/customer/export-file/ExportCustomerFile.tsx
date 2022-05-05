import React, {useCallback, useEffect, useState} from "react";
import {Button, Checkbox, Col, Modal, Progress, Radio, Row, Space} from "antd";
import {showError, showSuccess} from "utils/ToastUtils";

import {generateQuery} from "utils/AppUtils";
import {HttpStatus} from "config/http-status.config";
import {exportCustomerFile, getCustomerFile} from "service/customer/customer.service";

import {StyledModalFooter} from "screens/ecommerce/common/commonStyle";
import {ExportCustomerModalStyled} from "screens/customer/export-file/ExportCustomerStyled";

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
  const [isVisibleWarningExportModal, setIsVisibleWarningExportModal] = useState(false);
  const [exportPageAll, setExportPageAll] = useState(true);
  const [exportColumnAll, setExportColumnAll] = useState(true);
  const [exportCodeList, setExportCodeList] = useState<Array<any>>([]);

  const onChangeExportPageOption = (e: any) => {
    setExportPageAll(e.target.value);
  };

  const onChangeExportColumnOption = (e: any) => {
    setExportColumnAll(e.target.value);
  };

  // warning export 10k customers
  const onOkWarningExportModal = () => {
    setIsVisibleWarningExportModal(false);
  };

  const onCancelWarningExportModal = () => {
    setIsVisibleWarningExportModal(false);
    handleCancelExportModal();
  };
  // end warning export 10k customers

  const okExportModal = () => {
    let newParams = { ...params };
    newParams.search_type = undefined;  //remove search_type param
    if (exportPageAll) {
      newParams.limit = customerData?.metadata?.total;
      newParams.page = undefined;
    }
    const exportParams = generateQuery(newParams);

    exportCustomerFile({
      conditions: exportParams,
      fields: exportColumnAll ? null : columnSelectedList,
      type: "EXPORT_CUSTOMER",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setIsVisibleProgressModal(true);
          handleCancelExportModal();
          setExportCodeList([...exportCodeList, response.data.code]);
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  };

  const onOkExportModal = () => {
    resetProgress();
    if (exportPageAll && customerData?.metadata?.total >= 10000) {
      setIsVisibleWarningExportModal(true);
    } else {
      okExportModal();
    }
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
  }

  const onCancelProgressModal = () => {
    resetProgress();
    setExportPageAll(true);
    setIsVisibleProgressModal(false);
  };

  const checkExportFile = useCallback(() => {
    let getFilePromises = exportCodeList.map((code) => {
      return getCustomerFile(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (isVisibleProgressModal && response.code === HttpStatus.SUCCESS && response.data?.total > 0) {
          if (response.data.url) {
            const newExportCode = exportCodeList.filter((item) => {
              return item !== response.data.code;
            });
            setExportCodeList(newExportCode);
            setExportProgress(100);
            showSuccess("Xuất file dữ liệu khách hàng thành công!");
            window.open(response.data.url);
          } else {
            if (response.data.processed >= response.data.total) {
              setExportProgress(99);
            } else {
              const percent = Math.floor((response.data.processed / response.data.total) * 100);
              setExportProgress(percent);
            }
          }
        }
      });
    });
  }, [exportCodeList, isVisibleProgressModal]);

  useEffect(() => {
    if (exportProgress === 100 || exportCodeList.length === 0) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, exportProgress, exportCodeList]);
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
    {name: "Đơn vị", value: "code", isSelected: false},
    {name: "Điểm hiện tại", value: "point", isSelected: false},
    {name: "Tiền tích lũy", value: "total_paid_amount", isSelected: false},
    {name: "Ngày mua đầu", value: "first_order_time", isSelected: false},
    {name: "Ngày mua cuối", value: "last_order_time", isSelected: false},
  ];

  const [columnListOption, setColumnListOption] = useState<any>(columnListOptionDefault);
  const [columnSelectedList, setColumnSelectedList] = useState<Array<string>>([]);

  const onChangeColumnSelect = (e: any, column: any, index: number) => {
    const newColumnListOption = [...columnListOption];
    if (newColumnListOption && newColumnListOption[index]) {
      newColumnListOption[index].isSelected = e.target?.checked;
    }
    setColumnListOption(newColumnListOption);

    if (e.target.checked) {
      // column.isSelected = true;
      const newColumnSelectedList = [...columnSelectedList];
      newColumnSelectedList.push(column.value);
      setColumnSelectedList(newColumnSelectedList);
    } else {
      // column.isSelected = false;
      const newColumnSelectedList = columnSelectedList?.filter((columnSelected: any) => {
        return columnSelected !== column.value;
      });
      setColumnSelectedList(newColumnSelectedList);
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
          okButtonProps={{ disabled: (!exportColumnAll && !columnSelectedList.length) }}
          maskClosable={false}>
          <ExportCustomerModalStyled>
            <div className="export-customer-modal">
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
                  {columnListOption?.map((column: any, index: number) => (
                    <Col key={column.value} span={8} style={{ marginBottom: 10 }}>
                      <Checkbox
                        onChange={(e) => onChangeColumnSelect(e, column, index)}
                        checked={column.isSelected}>
                        {column.name}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              }
            </div>
          </ExportCustomerModalStyled>
        </Modal>
      }

      {/* Warning export customer data */}
      {isVisibleWarningExportModal &&
        <Modal
          centered
          width="600px"
          visible={isVisibleWarningExportModal}
          title=""
          closable={false}
          maskClosable={false}
          footer={
            <StyledModalFooter>
              <Button key="cancel-warning-modal" danger onClick={onCancelWarningExportModal}>
                Thoát
              </Button>

              <Button key="ok-warning-modal" type="primary" onClick={onOkWarningExportModal}>
                Đồng ý
              </Button>
            </StyledModalFooter>
          }>
          <div>
            Để đảm bảo hệ thống và tốc độ tải dữ liệu, xin vui lòng xuất dữ liệu dưới <b>10.000</b> khách hàng.
          </div>
          <div>Xin cảm ơn!</div>
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
                <span>Đang tạo file, vui lòng đợi trong giây lát!</span>
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
