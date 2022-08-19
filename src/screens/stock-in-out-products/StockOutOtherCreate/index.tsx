import { Button, Col, Form, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useEffect, useState } from "react";

import arrowLeft from "assets/icon/arrow-back.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch } from "react-redux";
import { StockInOutPolicyPriceField, StockInOutType } from "../constant";
import StockInOutWareHouseForm from "../components/StockInOutWareHouseForm";
import { callApiNative } from "utils/ApiUtils";
import { isEmpty } from "lodash";
import StockInOutInfoForm from "../components/StockInOutInfoForm";
import StockInOutProductForm from "../components/StockInOutProductForm";
import { useHistory } from "react-router-dom";
import { StockInOutOtherData } from "model/stock-in-out-other";
import { createStockInOutOthers } from "service/inventory/stock-in-out/index.service";
import { showError, showSuccess } from "utils/ToastUtils";
import { UploadFile } from "antd/es/upload/interface";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { ImportResponse } from "model/other/files/export-model";
import ModalImport from "../components/ModalImport";
import StockInOutProductUtils from "../util/StockInOutProductUtils";

const StockOutOtherCreate: React.FC = () => {
  const [isRequireNote, setIsRequireNote] = useState<boolean>(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isEmptyFile, setIsEmptyFile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [dataUploadError, setDataUploadError] = useState<any>(null);
  const [dataProcess, setDataProcess] = useState<ImportResponse>();
  const [data, setData] = useState<any>(null);
  const [formMain] = Form.useForm();
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [typePrice, setTypePrice] = useState<string>(StockInOutPolicyPriceField.import_price);

  const history = useHistory();
  const dispatch = useDispatch();

  const checkImportFile = () => {
    BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/other-stock-io/import/${fileId}`).then(
      (res: any) => {
        if (res.code !== 20000000) {
          setFileId(null);
          setIsLoading(false);
          setDataUploadError(res.errors);
          return;
        }
        setData(res);
        setDataProcess(res.process);

        const newDataUpdateError =
          !res.errors || (res.errors && res.errors.length === 0)
            ? null
            : res.errors;
        setDataUploadError(newDataUpdateError);
        if (res.status !== "FINISH") return;
        setFileId(null);
        setIsLoading(false);
      },
    );
  };

  useEffect(() => {
    if (!fileId) return;

    const getFileInterval = setInterval(checkImportFile, 2000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const onFinish = async (data: StockInOutOtherData) => {
    const stockInOutItems = data.stock_in_out_other_items;
    if (isEmpty(stockInOutItems)) {
      showError("Vui lòng thêm sản phẩm");
      return;
    }
    delete data.account; // Xóa dữ liệu thừa
    const response = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      createStockInOutOthers,
      data,
    );
    if (response) {
      history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`);
      showSuccess("Tạo phiếu thành công");
    }
  };

  const importFile = () => {
    if (fileList.length === 0) {
      setIsEmptyFile(true);
      return;
    }
    setIsEmptyFile(false);

    BaseAxios.post(`${ApiConfig.PURCHASE_ORDER}/other-stock-io/import`, {
      url: fileUrl
    })
      .then((res: any) => {
        if (res) {
          setFileId(res.data);
          setIsStatusModalVisible(true);
          setIsLoading(true);
          setDataProcess(res.process);
          const newDataUpdateError =
            !res.errors || (res.errors && res.errors.length === 0)
              ? null
              : res.data.errors;
          setDataUploadError(newDataUpdateError);
        }
      })
      .catch((err) => {
        showError(err);
      });
  };

  const importProduct = () => {
    setIsStatusModalVisible(false);
    if (!data) return;
    let newData = JSON.parse(data.data).map((i: any) => {
      return {
        ...i,
        [typePrice]: i[typePrice],
      }
    });

    let stockInOutOtherItems = formMain.getFieldValue('stock_in_out_other_items');

    if (stockInOutOtherItems && stockInOutOtherItems.length > 0) {
      let newStockInOutOtherItems = StockInOutProductUtils.addProduct(
        stockInOutOtherItems,
        newData,
        typePrice,
        'IMPORT'
      );

      formMain.setFieldsValue({
        stock_in_out_other_items: newStockInOutOtherItems,
      });

      return;
    }

    formMain.setFieldsValue({
      stock_in_out_other_items: newData,
    });
  };

  return (
    <ContentContainer
      title="Nhập xuất khác"
      breadcrumb={[
        {
          name: "Tạo phiếu xuất khác",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhập xuất khác",
          path: UrlConfig.STOCK_IN_OUT_OTHERS,
        },
        {
          name: "Tạo phiếu xuất khác",
        },
      ]}
    >
      <Form form={formMain} onFinish={onFinish}>
        <Row gutter={24} style={{ paddingBottom: 30 }}>
          <Col span={18}>
            <StockInOutWareHouseForm
              title="THÔNG TIN XUẤT KHO"
              fileUrl={fileUrl}
              setFileUrl={(value) => setFileUrl(value)}
              setIsEmptyFile={(value) => setIsEmptyFile(value)}
              isEmptyFile={isEmptyFile}
              fileList={fileList}
              setFileList={(files) => setFileList(files)}
              formMain={formMain}
              stockInOutType={StockInOutType.stock_out}
              setIsRequireNote={setIsRequireNote}
            />
            <StockInOutProductForm
              title="SẢN PHẨM XUẤT"
              formMain={formMain}
              typePrice={typePrice}
              setTypePrice={(value) => setTypePrice(value)}
              inventoryType={StockInOutType.stock_out}
            />
          </Col>
          <Col span={6}>
            <StockInOutInfoForm
              title="THÔNG TIN PHIẾU XUẤT"
              formMain={formMain}
              isRequireNote={isRequireNote}
              stockInOutType={StockInOutType.stock_out}
            />
          </Col>
        </Row>

        <BottomBarContainer
          leftComponent={
            <div
              onClick={() => {
                history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`);
                return;
                // }
              }}
              style={{ cursor: "pointer" }}
            >
              <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
              {"Quay lại danh sách"}
            </div>
          }
          rightComponent={
            <Space>
              <Button type="primary" onClick={() => importFile()}>
                Nhập file
              </Button>
              <Button type="primary" onClick={() => formMain.submit()}>
                Xuất kho
              </Button>
            </Space>
          }
        />
      </Form>

      {isStatusModalVisible && (
        <ModalImport
          loading={isLoading}
          visible={isStatusModalVisible}
          onCancel={() => {
            setIsStatusModalVisible(false);
          }}
          onOk={() => importProduct()}
          dataProcess={dataProcess}
          data={data}
          dataUploadError={dataUploadError}
        />
      )}
    </ContentContainer>
  );
};

export default StockOutOtherCreate;
