import { Button, Card, Col, Form, Input, Modal, Progress, Radio, Row, Space, Tabs, Upload, } from "antd";
import ContentContainer from "component/container/content.container";
import updateProductExampleImg from "assets/img/update_product_example.png";
import UrlConfig from "config/url.config";
import { ProductImportScreenStyled } from "./styled";
import BottomBarContainer from "component/container/bottom-bar.container";
import { UploadOutlined } from "@ant-design/icons";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { productImportAction } from "domain/actions/product/products.action";
import { showError, showWarning } from "utils/ToastUtils";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { FINISH_PROCESS_PERCENT, ProgressStatuses, START_PROCESS_PERCENT } from "../../helper";
import { STATUS_IMPORT_EXPORT } from "utils/Constants";

const ProductImportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [percent, setPercent] = useState(START_PROCESS_PERCENT);
  const [status, setStatus] = useState<number>(STATUS_IMPORT_EXPORT.NONE);

  const handleBeforeUpload = useCallback(
    (file) => {
      const fileData = [file];
      form.setFieldsValue({ file: [...fileData] });
      return false;
    },
    [form],
  );

  const onResult = useCallback(
    (value) => {
      if (value) {
        setTimeout(() => {
          setPercent(START_PROCESS_PERCENT);
          setStatus(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          setIsVisibleUpload(false);
          value.result.forEach((item: string) => {
            showWarning(item);
          });
          form.resetFields();
        }, 1000);
      } else {
        setTimeout(() => {
          setPercent(FINISH_PROCESS_PERCENT);
          setStatus(STATUS_IMPORT_EXPORT.JOB_FINISH);
          setIsVisibleUpload(false);
        }, 2000);
      }
    },
    [form],
  );

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [isVisibleUpload, setIsVisibleUpload] = useState<boolean>(false);

  const startImport = useCallback(
    (value) => {
      const { file, is_create } = value;
      setIsVisibleUpload(true);
      setStatus(STATUS_IMPORT_EXPORT.DEFAULT);
      setPercent(START_PROCESS_PERCENT);
      setTimeout(() => {
        setPercent(20);
        dispatch(productImportAction(file[0], is_create, onResult));
      }, 1000);
    },
    [dispatch, onResult],
  );

  const importFile = useCallback(() => {
    const value = form.getFieldsValue(true);
    const { file } = value;
    if (file.length === 0) {
      showError("Vui lòng chọn file");
      return;
    }
    setModalConfirm({
      visible: true,
      cancelText: "Hủy",
      title: "Xác nhận",
      subTitle: "Xác nhận import file?",
      okText: "Đồng ý",
      onCancel: () => {
        setModalConfirm({ visible: false });
      },
      onOk: () => {
        setModalConfirm({ visible: false });
        form.submit();
      },
    });
  }, [form]);

  return (
    <ProductImportScreenStyled>
      <Form
        initialValues={{
          is_create: "true",
          file: [],
        }}
        form={form}
        onFinish={startImport}
        layout="vertical"
      >
        <ContentContainer
          title="Nhập File"
          breadcrumb={[
            {
              name: "Tổng quan",
              path: UrlConfig.HOME,
            },
            {
              name: "Sản phẩm",
              path: `${UrlConfig.PRODUCT}`,
            },
            {
              name: "Nhập file",
            },
          ]}
        >
          <Card className="margin-top-20">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Nhập mới" key="1">
                <div className="padding-20">
                  <img src={updateProductExampleImg} alt="" />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Cập nhập thông tin" key="2">
                <div className="padding-20">
                  <img src={updateProductExampleImg} alt="" />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>

          <Row gutter={18}>
            <Col span={18}>
              <Card className="margin-top-20" title="Thông tin import">
                <div className="padding-20">
                  <Form.Item name="is_create" label="Kiểu Import:">
                    <Radio.Group>
                      <Radio value="true">Thêm mới</Radio>
                      <Radio value="false">Cập nhật thông tin</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item noStyle name="file" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    shouldUpdate={(before, current) => before.file !== current.file}
                    label="File excel:"
                  >
                    {({ getFieldValue }) => {
                      const file = getFieldValue("file");
                      return (
                        <Upload fileList={file} beforeUpload={handleBeforeUpload}>
                          <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                      );
                    }}
                  </Form.Item>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="margin-top-20" title="Link file Excel mẫu">
                <div className="padding-20">
                  <p>Mẫu thêm mới:</p>
                  <p>Mẫu cập nhật:</p>
                </div>
              </Card>
            </Col>
          </Row>
        </ContentContainer>
        <BottomBarContainer
          back="Quay lại"
          rightComponent={
            <Space>
              <Button onClick={importFile} type="primary">
                Import
              </Button>
            </Space>
          }
        />
        <ModalConfirm {...modalConfirm} />
        <Modal
          className="ant-modal-header-nostyle ant-modal-footer-nostyle ant-modal-close-nostyle"
          visible={isVisibleUpload}
        >
          <div style={{ display: "flex", justifyContent: "center" }} className="modal-upload">
            <Progress
              type="circle"
              percent={percent}
              width={200}
              status={status === STATUS_IMPORT_EXPORT.DEFAULT
                ? ProgressStatuses.NORMAL
                : status === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS
                  ? ProgressStatuses.SUCCESS
                  : ProgressStatuses.EXCEPTION}
            />
          </div>
        </Modal>
      </Form>
    </ProductImportScreenStyled>
  );
};

export default ProductImportScreen;
