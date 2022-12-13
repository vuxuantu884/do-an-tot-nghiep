import { Button, Card, Col, Form, FormInstance, Input, Row, Select, Upload } from "antd";
import Text from "antd/lib/typography/Text";
import { isEmpty } from "lodash";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getListStore } from "service/core/store.service";
import { callApiNative } from "utils/ApiUtils";
import {
  StockInOutField,
  StockInOutType,
  stockInReason,
  StockInReasonField,
  stockOutReason,
  StockOutReasonField,
} from "../constant";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/lib/upload/interface";
import "./stock-in-out.scss";
import excelIcon from "assets/icon/icon-excel.svg";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { HttpStatus } from "config/http-status.config";

interface StockInOutWareHouseFormProps {
  title: string;
  formMain: FormInstance;
  stockInOutType: string;
  isEmptyFile: boolean;
  fileList: Array<UploadFile>;
  setFileList: (file: any) => any;
  fileUrl: string;
  setFileUrl: (file: any) => any;
  setIsEmptyFile: (value: any) => any;
  setIsRequireNote: (require: boolean) => void;
}

type AccountStore = {
  id: number;
  store_id: number;
  store: string;
};

const StockInOutWareHouseForm: React.FC<StockInOutWareHouseFormProps> = (
  props: StockInOutWareHouseFormProps,
) => {
  const {
    title,
    stockInOutType,
    setIsRequireNote,
    formMain,
    fileList,
    setFileList,
    isEmptyFile,
    setIsEmptyFile,
    fileUrl,
    setFileUrl
  } = props;
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const userStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );
  const dispatch = useDispatch();

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getListStore);
    const accountStores = userStores?.map((store: AccountStore) => {
      return { id: store.store_id, name: store.store };
    });
    if (res && userStores && userStores.length === 0) {
      setListStore(res);
    } else if (userStores && userStores.length === 1) {
      setListStore(accountStores);
      formMain.setFieldsValue({
        [StockInOutField.store_id]: accountStores[0].id,
      });
      formMain.setFieldsValue({
        [StockInOutField.store]: accountStores[0].name,
      });
    } else if (userStores && userStores.length > 0) {
      setListStore(accountStores);
    }
  }, [dispatch, formMain, setListStore, userStores]);

  useEffect(() => {
    getStores();
  }, [getStores]);

  // upload customer file
  const beforeUploadFile = useCallback(() => {}, []);

  const onRemoveFile = () => {
    setFileList([]);
  };

  const onChangeFile = useCallback((info) => {
    if (info.fileList.length > 0) setIsEmptyFile(false);
    setFileList(info.fileList);
  }, [setFileList, setIsEmptyFile]);

  const exportTemplate = (e: any) => {
    let worksheet = XLSX.utils.json_to_sheet([
      {
        [`Mã sản phẩm`]: null,
        [`Số lượng`]: null,
      },
    ]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `import_so_luong_san_pham` + fileExtension);
    e.preventDefault();
  };

  const onCustomUpdateRequest = (options: UploadRequestOption) => {
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      files.push(file);

      uploadFileApi(files, 'stock-in-out').then((res: any) => {
        if (res.code === HttpStatus.SUCCESS) {
          setFileUrl(res.data[0]);
        }
      });
    }
  };

  return (
    <Card title={title} bordered={false}>
      <Row className="upload">
        <div>
          <Upload
            beforeUpload={beforeUploadFile}
            onRemove={onRemoveFile}
            multiple={false}
            fileList={fileList}
            customRequest={onCustomUpdateRequest}
            onChange={onChangeFile}
            showUploadList={false}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          >
            <Button icon={<UploadOutlined />}><span className="btn-upload">Nhập file sản phẩm</span></Button>
          </Upload>
          <div>{fileUrl && 'Import_so_luong_san_pham.xlsx'}</div>
        </div>
        <div className="note">
          <span className="sample-title-link">Link file excel mẫu:</span>
          <img src={excelIcon} alt="" />{" "}
          <a href="/" onClick={exportTemplate}>
            Mẫu file nhập xuất khác(.xlsx)
          </a>
        </div>
      </Row>
      {isEmptyFile && (
        <div className="text-error">
          Vui lòng chọn file sản phẩm
        </div>
      )}
      <Row gutter={24}>
        <Form.Item name={StockInOutField.store} noStyle hidden>
          <Input />
        </Form.Item>
        <Col span={12}>
          <Text strong>Kho hàng </Text>
          <span style={{ color: "red" }}>*</span>
          <Form.Item
            name={[StockInOutField.store_id]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho hàng",
              },
            ]}
          >
            <Select
              autoClearSearchValue={false}
              allowClear
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="Chọn 1 kho hàng"
              onSelect={(value: number) => {
                const store = listStore.find((item: StoreResponse) => item.id === value);
                if (store)
                  formMain.setFieldsValue({
                    [StockInOutField.store]: store.name,
                  });
              }}
            >
              {!isEmpty(listStore) &&
                listStore.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          {stockInOutType === StockInOutType.stock_in ? (
            <>
              <Text strong>Lý do nhập </Text>
              <span style={{ color: "red" }}>*</span>
              <Form.Item
                name={[StockInOutField.stock_in_out_reason]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn lý do nhập",
                  },
                ]}
              >
                <Select
                  autoClearSearchValue={false}
                  allowClear
                  showSearch
                  showArrow
                  optionFilterProp="children"
                  placeholder="Chọn lý do nhận"
                  onChange={(value) => {
                    if (value && value === StockInReasonField.stock_in_other)
                      setIsRequireNote(true);
                    else setIsRequireNote(false);
                  }}
                >
                  {stockInReason.map((item, i) => (
                    <Select.Option key={i} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            <>
              <Text strong>Lý do xuất </Text>
              <span style={{ color: "red" }}>*</span>
              <Form.Item
                name={[StockInOutField.stock_in_out_reason]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn lý do xuất",
                  },
                ]}
              >
                <Select
                  autoClearSearchValue={false}
                  allowClear
                  showSearch
                  showArrow
                  optionFilterProp="children"
                  placeholder="Chọn lý do xuất"
                  onChange={(value) => {
                    if (value && value === StockOutReasonField.stock_out_other)
                      setIsRequireNote(true);
                    else setIsRequireNote(false);
                  }}
                >
                  {stockOutReason.map((item, i) => (
                    <Select.Option key={i} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default StockInOutWareHouseForm;
