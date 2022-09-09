import { CloseOutlined, IssuesCloseOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Space, Spin, Typography, Upload } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ConAcceptImport, DAILY_REVENUE_IMPORT } from "utils/Constants";
import { StyleComponent } from "./style";
import excelIcon from "assets/icon/icon-excel.svg";
import { RcFile } from "antd/lib/upload";
import { UploadFile } from "antd/es/upload/interface";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useSelector } from "react-redux";
import { ImportFileModel } from "model/revenue";
import {
  importOtherPaymentDailyRevenueService,
  importPaymentConfirmDailyRevenueService,
} from "service/daily-revenue";
import { showError, showModalSuccess } from "utils/ToastUtils";
import { getBase64 } from "../Helper";
import Text from "antd/lib/typography/Text";
import BottomBarContainer from "component/container/bottom-bar.container";
import fileOtherPayment from "assets/file/File_Nhap_thu_chi.xlsx";
import fileConfirmPayment from "assets/file/File_Nhap_tien_thuc_nhan.xlsx";
import useAuthorization from "hook/useAuthorization";
import { DAILY_REVENUE_PERMISSIONS } from "config/permissions/daily-revenue.permission";
import NoPermission from "screens/no-permission.screen";

type DailyRevenueParam = {
  type: string;
};
const DailyRevenueImport: React.FC = () => {
  const { type } = useParams<DailyRevenueParam>();
  const history = useHistory();
  const [message, setMessage] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDisableBtnImport, setIsDisableBtnImport] = useState<boolean>(true);

  const accountReducer = useSelector((state: RootReducerType) => state.userReducer.account);

  const [form] = Form.useForm();

  const [allowDailyPaymentsImportPayment] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_import_payment],
  });
  const [allowDailyPaymentsImportOtherPayment] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_import_other_payment],
  });

  const onBeforeUpload = useCallback(
    (file: RcFile, FileList: RcFile[]) => {
      //let fileData = FileList;
      console.log(file);
      let fileData = form.getFieldValue("file") || [];
      let newFileData = [...fileData, ...FileList];

      let newFiledataUnique = [...new Map(newFileData.map((m) => [m.lastModified, m])).values()];
      form.setFieldsValue({ file: newFiledataUnique });
      setIsDisableBtnImport(newFiledataUnique.length === 0 ? true : false);
      return false;
    },
    [form],
  );

  const onRemove = useCallback(
    (file: UploadFile<RcFile>) => {
      let fileData: RcFile[] = form.getFieldValue("file") || [];
      const index = [...fileData].findIndex((p) => p.uid === file.uid);
      fileData.splice(index, 1);
      form.setFieldsValue({ file: [...fileData] });
      setIsDisableBtnImport(fileData.length === 0 ? true : false);
    },
    [form],
  );

  const handleImportFile = useCallback(
    (request: RcFile[], type: string) => {
      (async () => {
        setLoading(true);

        let message: string[] = [];
        await Promise.all(
          request.map(async (p, index) => {
            const fileToBase64 = await getBase64(p);
            const request: ImportFileModel = {
              file_name: p.name,
              file_size: p.size,
              store_id: 0,
              // store_name: "YODY Đức Thọ",
              reported_by: accountReducer?.code,
              reported_name: accountReducer?.full_name,
              base64: fileToBase64 as string,
            };
            let result: any = undefined;
            if (type === DAILY_REVENUE_IMPORT.OTHER_PAYMENT) {
              result = await importOtherPaymentDailyRevenueService(request);
            } else if (type === DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT) {
              result = await importPaymentConfirmDailyRevenueService(request);
            }

            if (result) {
              console.log(result);
              if (result?.status && result?.status !== 200) {
                let ms: string[] = ((result?.data?.detail as string).split("|") || []).map((p) => {
                  return request.file_name + " -> " + p;
                });
                message = [...message, ...ms];
              } else {
                showModalSuccess("Nhập file thành công");
              }
            }
          }),
        );
        form.resetFields();
        setIsDisableBtnImport(true);
        setMessage(message);
      })().finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      });
    },
    [accountReducer?.code, accountReducer?.full_name, form],
  );

  const onFinish = useCallback(
    (value) => {
      const file: RcFile[] = value.file || [];
      console.log(file);

      if (file.length === 0) {
        showError("Vui lòng chọn File");
        return;
      }
      switch (type) {
        case DAILY_REVENUE_IMPORT.OTHER_PAYMENT:
          handleImportFile(file, DAILY_REVENUE_IMPORT.OTHER_PAYMENT);
          break;
        case DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT:
          handleImportFile(file, DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT);
          break;
        default:
          break;
      }
    },
    [handleImportFile, type],
  );

  if (
    type !== DAILY_REVENUE_IMPORT.OTHER_PAYMENT &&
    type !== DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT
  ) {
    history.push(`${UrlConfig.DAILY_REVENUE}`);
  }
  return (
    <ContentContainer
      title={`Nhập file ${
        type === DAILY_REVENUE_IMPORT.OTHER_PAYMENT
          ? "thu chi"
          : type === DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT
          ? "nhận tiền"
          : ""
      }`}
      breadcrumb={[
        {
          name: "Tổng kết ca",
        },
        {
          name: "Danh sách phiếu",
          path: UrlConfig.DAILY_REVENUE,
        },
        {
          name: "Nhập file",
        },
      ]}
    >
      {(type === DAILY_REVENUE_IMPORT.OTHER_PAYMENT && !allowDailyPaymentsImportOtherPayment) ||
      (type === DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT && !allowDailyPaymentsImportPayment) ? (
        <NoPermission />
      ) : (
        <React.Fragment>
          <StyleComponent>
            <Row gutter={24}>
              <Col span={18}>
                <Card title={`THÔNG TIN NHẬP FILE`}>
                  <Spin spinning={loading} tip="Đang chạy...">
                    <Form
                      layout="horizontal"
                      form={form}
                      initialValues={{
                        file: [],
                      }}
                      onFinish={onFinish}
                    >
                      <Form.Item noStyle name="file" hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label="Tải file lên"
                        shouldUpdate={(before, current) => before.file !== current.file}
                      >
                        {({ getFieldValue }) => {
                          let file = getFieldValue("file");

                          return (
                            <Upload
                              fileList={file}
                              beforeUpload={onBeforeUpload}
                              accept={ConAcceptImport}
                              onRemove={onRemove}
                              multiple={true}
                            >
                              <Button icon={<UploadOutlined />}>Chọn file</Button>
                            </Upload>
                          );
                        }}
                      </Form.Item>

                      <Form.Item className="btn-import">
                        <Button htmlType="submit" disabled={isDisableBtnImport}>
                          Nhập file
                        </Button>
                      </Form.Item>
                    </Form>
                  </Spin>
                  {message.length !== 0 && !loading && (
                    <Row className="error">
                      <CloseOutlined
                        className="remove-error"
                        onClick={() => {
                          setMessage([]);
                        }}
                      />
                      <Space direction="vertical">
                        {message.map((p, index) => (
                          <Text type="danger" key={index}>
                            <IssuesCloseOutlined style={{ marginRight: 5 }} />
                            {p}
                          </Text>
                        ))}
                      </Space>
                    </Row>
                  )}
                </Card>
              </Col>
              <Col span={6}>
                <Card title={`FILE EXCEL MẪU`}>
                  <Typography.Text>
                    <img src={excelIcon} alt="" />{" "}
                    <a
                      href={
                        type === DAILY_REVENUE_IMPORT.OTHER_PAYMENT
                          ? fileOtherPayment
                          : type === DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT
                          ? fileConfirmPayment
                          : `${UrlConfig.DAILY_REVENUE}/import/${type}`
                      }
                    >
                      Ấn để tải xuống file{" "}
                      {type === DAILY_REVENUE_IMPORT.OTHER_PAYMENT
                        ? " thu chi"
                        : type === DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT
                        ? " nhận tiền"
                        : undefined}{" "}
                      (.xlsx)
                    </a>
                  </Typography.Text>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              back="Trở lại danh sách"
              backAction={() => {
                history.push(`${UrlConfig.DAILY_REVENUE}`);
              }}
            />
          </StyleComponent>
        </React.Fragment>
      )}
    </ContentContainer>
  );
};

export default DailyRevenueImport;
