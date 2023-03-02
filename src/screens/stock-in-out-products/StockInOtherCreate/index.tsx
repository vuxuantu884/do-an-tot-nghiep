import { Button, Col, Form, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useEffect, useState, useContext } from "react";

import arrowLeft from "assets/icon/arrow-back.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch, useSelector } from "react-redux";
import { StockInOutField, StockInOutPolicyPriceField, EnumStockInOutType, STATUS_IMPORT_STOCK_IO } from "../constant";
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
import ModalImport from "../components/ModalImport";
import { ImportResponse } from "model/other/files/export-model";
import StockInOutProductUtils from "../util/StockInOutProductUtils";
import { isNullOrUndefined } from "utils/AppUtils";
import StockInOutAlertPricePermission from "../components/StockInOutAlertPricePermission";
import { ProductPermission } from "config/permissions/product.permission";
import { UploadOutlined } from "@ant-design/icons";
import useAuthorization from "hook/useAuthorization";
import { StockInOutCreateContext, StockInOutCreateProvider } from "../provider";
import { RootReducerType } from "model/reducers/RootReducerType";
import StockInOtherCreateWrapper from "./styles";
import { HttpStatus } from "config/http-status.config";

const StockInOtherCreate: React.FC = () => {
  const [isRequireNote, setIsRequireNote] = useState<boolean>(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyFile, setIsEmptyFile] = useState(false);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [dataUploadError, setDataUploadError] = useState<any>(null);
  const [dataProcess, setDataProcess] = useState<ImportResponse>();
  const [data, setData] = useState<any>(null);
  const [formMain] = Form.useForm();
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [typePrice, setTypePrice] = useState<string>(StockInOutPolicyPriceField.import_price);
  const [allowReadImportPrice] = useAuthorization({
    acceptPermissions: [ProductPermission.read_import],
  });
  const [allowReadCostPrice] = useAuthorization({
    acceptPermissions: [ProductPermission.read_cost],
  });

  const { variantsResult, setVariantsResult, storeID, setStoreID } =
    useContext(StockInOutCreateContext);
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );
  const readPricePermissions: string[] = currentPermissions.filter(
    (el: string) => el === ProductPermission.read_cost || el === ProductPermission.read_import,
  );
  const history = useHistory();
  const dispatch = useDispatch();

  const checkImportFile = () => {
    BaseAxios.get(`${ApiConfig.STOCK_IN_OUT}/other-stock-io/import/${fileId}`).then((res: any) => {
      if (res.code !== HttpStatus.SUCCESS) {
        setFileId(null);
        setIsLoading(false);
        setDataUploadError(res.errors);
        return;
      }
      setData(res);
      setDataProcess(res.process);

      const newDataUpdateError =
        !res.errors || (res.errors && res.errors.length === 0) ? null : res.errors;
      setDataUploadError(newDataUpdateError);
      if (res.status !== STATUS_IMPORT_STOCK_IO.FINISH) return;
      setFileId(null);
      setIsLoading(false);
    });
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
    const storeID = formMain.getFieldValue(StockInOutField.store_id);
    if (!storeID) {
      showError("Bạn chưa chọn kho hàng");
      return;
    }
    if (fileList.length === 0 || !fileUrl) {
      setIsEmptyFile(true);
      const element: any = document.getElementById("stock_in_out_file");
      const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
      window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    BaseAxios.post(`${ApiConfig.STOCK_IN_OUT}/other-stock-io/import`, {
      url: fileUrl,
      store_id: formMain.getFieldValue(StockInOutField.store_id),
      type: EnumStockInOutType.StockIn,
    })
      .then((res: any) => {
        if (res.data) {
          setFileId(res.data);
          setIsStatusModalVisible(true);
          setIsLoading(true);
          setDataProcess(res.process);
          const newDataUpdateError =
            !res.errors || (res.errors && res.errors.length === 0) ? null : res.data.errors;
          setDataUploadError(newDataUpdateError);
        } else {
          showError(res.errors);
        }
      })
      .catch((err) => {
        showError(err);
      });
  };

  const importProduct = () => {
    setIsStatusModalVisible(false);
    setFileList([]);
    setFileUrl("");
    setFileId(null);
    if (!data) return;
    let newData = JSON.parse(data.data).map((i: any) => {
      let amount: any = i[typePrice] * i.quantity;
      if (isNullOrUndefined(i[typePrice])) amount = null;
      return {
        ...i,
        [typePrice]: i[typePrice],
        amount: amount,
      };
    });

    let stockInOutOtherItems = formMain.getFieldValue("stock_in_out_other_items");

    if (stockInOutOtherItems && stockInOutOtherItems.length > 0) {
      let newStockInOutOtherItems = StockInOutProductUtils.addProduct(
        stockInOutOtherItems,
        newData,
        typePrice,
        "IMPORT",
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

  const submitFailed = ({ errorFields }: any) => {
    const element: any = document.getElementById(errorFields[0].name.join("_"));
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <ContentContainer
      title="Tạo phiếu nhập khác"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhập xuất khác",
          path: UrlConfig.STOCK_IN_OUT_OTHERS,
        },
        {
          name: "Tạo phiếu nhập khác",
        },
      ]}
    >
      <StockInOtherCreateWrapper>
        <Form form={formMain} onFinish={onFinish} onFinishFailed={submitFailed}>
          <Row gutter={24} style={{ paddingBottom: 30 }}>
            <Col span={18}>
              <StockInOutWareHouseForm
                setFileUrl={setFileUrl}
                setIsEmptyFile={(value) => setIsEmptyFile(value)}
                isEmptyFile={isEmptyFile}
                fileList={fileList}
                setFileList={(files) => setFileList(files)}
                title="THÔNG TIN NHẬP KHO"
                formMain={formMain}
                stockInOutType={EnumStockInOutType.StockIn}
                setIsRequireNote={setIsRequireNote}
                setVariantsResult={setVariantsResult}
                storeID={storeID}
                setStoreID={setStoreID}
              />
              {(!allowReadImportPrice || !allowReadCostPrice) && (
                <StockInOutAlertPricePermission
                  allowReadImportPrice={allowReadImportPrice}
                  allowReadCostPrice={allowReadCostPrice}
                />
              )}
              <StockInOutProductForm
                title="SẢN PHẨM NHẬP"
                formMain={formMain}
                typePrice={typePrice}
                setTypePrice={(value) => setTypePrice(value)}
                allowReadImportPrice={allowReadImportPrice}
                allowReadCostPrice={allowReadCostPrice}
                inventoryType={EnumStockInOutType.StockIn}
                readPricePermissions={readPricePermissions}
                variantsResult={variantsResult}
                setVariantsResult={setVariantsResult}
              />
            </Col>
            <Col span={6}>
              <StockInOutInfoForm
                title="THÔNG TIN PHIẾU NHẬP"
                formMain={formMain}
                isRequireNote={isRequireNote}
                stockInOutType={EnumStockInOutType.StockIn}
              />
            </Col>
          </Row>

          <BottomBarContainer
            leftComponent={
              <div
                onClick={() => {
                  history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`);
                  return;
                }}
                style={{ cursor: "pointer" }}
              >
                <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                {"Quay lại danh sách"}
              </div>
            }
            rightComponent={
              <Space>
                <Button onClick={() => importFile()} icon={<UploadOutlined />}>
                  Nhập file
                </Button>
                <Button type="primary" onClick={() => formMain.submit()}>
                  Nhập kho
                </Button>
              </Space>
            }
          />
        </Form>
      </StockInOtherCreateWrapper>

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

const StockInCreateWithProvider = (props: any) => (
  <StockInOutCreateProvider>
    <StockInOtherCreate {...props} />
  </StockInOutCreateProvider>
);

export default StockInCreateWithProvider;
