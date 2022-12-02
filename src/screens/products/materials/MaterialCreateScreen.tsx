import { EditOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Popover, Row, Select, Space, Switch, Upload } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import UrlConfig from "config/url.config";
import { MaterialCreateRequest } from "model/product/material.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { showError, showSuccess } from "utils/ToastUtils";
import ModalCares from "../component/CareInformation";
import "./style.scss";
import { UploadFile } from "antd/es/upload/interface";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { RegUtil } from "utils/RegUtils";
import { callApiNative } from "utils/ApiUtils";
import { uploadFileApi } from "service/core/import.service";
import { createMaterialApi } from "service/product/material.service";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import { checkFile, convertLabelSelected, validateNumberValue } from "screens/products/helper";
import { RuleObject, StoreValue } from "rc-field-form/lib/interface";
import { RcFile, UploadChangeParam } from "antd/lib/upload/interface";

const initialRequest: MaterialCreateRequest = {
  fabric_code: "",
  care_labels: "",
  application: "",
  code: "",
  component: "",
  description: "",
  name: "",
  advantages: "Không có ưu điểm",
  defect: "Không có khuyến cáo",
  preserve: "",
  status: "inactive",
  fabric_size_unit: "m",
  weight_unit: "g/m2",
  price_unit: "VND",
  price_measure_unit: "m",
  videos: [],
  images: [],
};

const AddMaterial: React.FC = () => {
  const materialStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.material_status,
  );
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowCareModal, setIsShowCareModal] = useState(false);
  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");
  const [status, setStatus] = useState<string>(initialRequest.status);
  const fabricSizeUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.fabric_size_unit,
  );
  const weightUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_material_unit,
  );
  const priceUnit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.currency);
  const priceMeasureUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.price_measure_unit,
  );
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [fileListVideo, setFileListVideo] = useState<Array<UploadFile>>([]);

  const createMaterial = useCallback(
    async (values: MaterialCreateRequest) => {
      const newValue = {
        ...values,
        status: status,
        component: values.component.trim(),
        description: values.description.trim(),
        name: values.name.trim(),
        advantages: form.getFieldValue("advantages"),
        defect: form.getFieldValue("defect"),
        preserve: values.preserve.trim(),
        care_labels: careLabelsString,
      };
      setIsLoading(true);
      await callApiNative({ isShowLoading: false }, dispatch, createMaterialApi, newValue).then(
        (res) => {
          setIsLoading(false);
          if (res && res.errors) {
            res.errors.forEach((e: string) => showError(e));
            return;
          } else if (res) {
            showSuccess("Thêm chất liệu thành công");
            history.push(UrlConfig.MATERIALS);
          }
        },
      );
      setIsLoading(false);
    },
    [careLabelsString, dispatch, form, history, status],
  );

  useEffect(() => {
    const newSelected = careLabelsString ? careLabelsString.split(";") : [];

    const careLabels = convertLabelSelected(newSelected);

    setCareLabels(careLabels);
  }, [careLabelsString]);

  const statusValue = useMemo(() => {
    if (!materialStatusList) {
      return "";
    }
    const index = materialStatusList?.findIndex((item) => item.value === status);
    if (index !== -1) {
      return materialStatusList?.[index].name;
    }
    return "";
  }, [materialStatusList, status]);

  const checkBeforeUpload = useCallback((file: UploadFile, type: string) => {
    return checkFile(file, type, true) ? true : Upload.LIST_IGNORE;
  }, []);

  const removeFile = (data: UploadFile<any>, type: string) => {
    switch (type) {
      case "img":
        let index = fileList.findIndex((item) => item.uid === data.uid);
        if (index !== -1) {
          fileList.splice(index, 1);
          let fileCurrent: Array<string> = form.getFieldValue("images");
          if (!fileCurrent) {
            fileCurrent = [];
          } else {
            fileCurrent.splice(index, 1);
          }
          let newFileCurrent = [...fileCurrent];
          form.setFieldsValue({ images: newFileCurrent });
        }
        setFileList([...fileList]);
        break;
      case "video":
        let indexVideo = fileListVideo.findIndex((item) => item.uid === data.uid);
        if (indexVideo !== -1) {
          fileListVideo.splice(indexVideo, 1);
          let fileCurrent: Array<string> = form.getFieldValue("videos");
          if (!fileCurrent) {
            fileCurrent = [];
          } else {
            fileCurrent.splice(indexVideo, 1);
          }
          let newFileCurrent = [...fileCurrent];
          form.setFieldsValue({ videos: newFileCurrent });
        }
        setFileListVideo([...fileListVideo]);
        break;
      default:
        break;
    }
  };

  const changeFile = useCallback((info, type: string) => {
    let check = true;
    if (info.fileList) {
      info.fileList.forEach((file: RcFile) => {
        if (!checkFile(file, type)) {
          check = false;
          return;
        }
      });
    }
    if (!check) return;

    if (type === "video") {
      setFileListVideo(info.fileList);
    } else {
      setFileList(info.fileList);
    }
  }, []);

  const customRequest = async (options: UploadRequestOption<any>, type: string) => {
    const { file } = options;
    if (!checkFile(file, type)) return;

    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      if (type === "video") {
        await callApiNative(
          { isShowLoading: false },
          dispatch,
          uploadFileApi,
          files,
          "material-info",
        ).then((data: false | Array<string>) => {
          let index = fileListVideo.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              fileListVideo[index].status = "done";
              fileListVideo[index].url = data[0];
              let fileCurrent: Array<string> = form.getFieldValue("videos");
              if (!fileCurrent) {
                fileCurrent = [];
              }
              let newFileCurrent = [...fileCurrent, data[0]];
              form.setFieldsValue({ videos: newFileCurrent });
            }
          } else {
            fileListVideo.splice(index, 1);
            showError("Upload video không thành công");
          }
          setFileListVideo([...fileListVideo]);
        });
      } else {
        await callApiNative(
          { isShowLoading: false },
          dispatch,
          uploadFileApi,
          files,
          "material-info",
        ).then((data: false | Array<string>) => {
          let index = fileList.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              fileList[index].status = "done";
              fileList[index].url = data[0];
              let fileCurrent: Array<string> = form.getFieldValue("images");
              if (!fileCurrent) {
                fileCurrent = [];
              }
              let newFileCurrent = [...fileCurrent, data[0]];
              form.setFieldsValue({ images: newFileCurrent });
            }
          } else {
            fileList.splice(index, 1);
            showError("Upload ảnh không thành công");
          }
          setFileList([...fileList]);
        });
      }
    }
  };

  const validateAdvantages = (rule: RuleObject, value: StoreValue, callback: (error?: string) => void): void => {
    if (!value || value === "<p><br></p>") {
      callback(`Vui lòng nhập ưu điểm`);
    } else {
      callback();
    }
  };

  const handleNumberInputChange = (name: "price" | "fabric_size" | "weight") => {
    let vl: string = form.getFieldValue(name).toString();
    form.setFields([{ ...validateNumberValue(vl), name }]);
  };

  return (
    <ContentContainer
      title="Thêm chất liệu"
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Thuộc tính",
        },
        {
          name: "Chất liệu",
          path: `${UrlConfig.MATERIALS}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form form={form} onFinish={createMaterial} initialValues={initialRequest} layout="vertical">
        <Row gutter={20} className="category-info">
          <Col span={16}>
            <Card title="Thông tin cơ bản">
              <Row gutter={50}>
                <Col span={24} lg={12} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message: "Vui lòng nhập tên chất liệu",
                      },
                      {
                        max: 255,
                        message: "Tên chất liệu không vượt quá 255 ký tự",
                      },
                    ]}
                    label="Tên chất liệu:"
                    name="name"
                  >
                    <Input placeholder="Tên chất liệu" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        whitespace: true,
                      },
                    ]}
                    name="code"
                    label="ID chất liệu:"
                  >
                    <Input disabled placeholder="Tự động sinh" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={12} md={12} sm={24}>
                  <Form.Item
                    tooltip={{
                      title:
                        "Mã chỉ bao gồm ký tự in hoa hoặc số viết liền không dấu, không bao gồm ký tự đặc biệt",
                      icon: <InfoCircleOutlined />,
                    }}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Vui lòng nhập mã chất liệu",
                      },
                      {
                        pattern: RegUtil.NO_SPECICAL_CHARACTER_MATERIAL,
                        message: "Mã chất liệu không đúng định dạng",
                      },
                    ]}
                    name="fabric_code"
                    label="Mã chất liệu:"
                    normalize={(value: string) => (value || "").toUpperCase()}
                  >
                    <Input placeholder="Nhập mã chất liệu" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12} md={12} sm={24}>
                  <SupplierSearchSelect
                    label="Nhà cung cấp:"
                    name="supplier_ids"
                    mode="multiple"
                    maxTagCount="responsive"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nhà cung cấp",
                      },
                    ]}
                  />
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={12} md={12} sm={24}>
                  <Form.Item
                    name="component"
                    label="Thành phần:"
                    rules={[{ max: 255, message: "Thành phần không quá 255 kí tự" }]}
                  >
                    <Input placeholder="Nhập thành phần" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12} md={12} sm={24}>
                  <Form.Item name="preserve" label="Thông tin bảo quản:">
                    {careLabels.map((item: any) => (
                      <Popover content={item.name}>
                        <span className={`care-label ydl-${item.value}`}></span>
                      </Popover>
                    ))}
                    <Button
                      className={`button-plus`}
                      icon={
                        careLabelsString && careLabelsString.length > 0 ? (
                          <EditOutlined />
                        ) : (
                          <PlusOutlined />
                        )
                      }
                      onClick={() => setIsShowCareModal(true)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24} md={24} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập ưu điểm",
                      },
                      {
                        validator: validateAdvantages,
                      },
                    ]}
                    name="advantages"
                    label="Ưu điểm:"
                  >
                    <CustomEditor />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24} md={24} sm={24}>
                  <Form.Item name="defect" label="Khuyến cáo:">
                    <CustomEditor />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={24} md={7} sm={7} lg={7}>
                  <Form.Item label="Khổ vải:">
                    <Input.Group compact>
                      <Form.Item name="fabric_size" noStyle>
                        <Input
                          placeholder="Khổ vải"
                          type="number"
                          style={{ width: "calc(100% - 100px)", textAlign: "right" }}
                          onChange={() => handleNumberInputChange("fabric_size")}
                        />
                      </Form.Item>
                      <Form.Item name="fabric_size_unit" noStyle>
                        <Select placeholder="Đơn vị" style={{ width: "100px" }}>
                          {fabricSizeUnit?.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col span={24} md={7} sm={7} lg={7}>
                  <Form.Item label="Trọng lượng:">
                    <Input.Group compact>
                      <Form.Item name="weight" noStyle>
                        <Input
                          placeholder="Trọng lượng"
                          type="number"
                          style={{ width: "calc(100% - 100px)", textAlign: "right" }}
                          onChange={() => handleNumberInputChange("weight")}
                        />
                      </Form.Item>
                      <Form.Item name="weight_unit" noStyle>
                        <Select placeholder="Trọng lượng" style={{ width: "100px" }}>
                          {weightUnit?.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col span={24} md={10} sm={10} lg={10}>
                  <Form.Item label="Giá:">
                    <Input.Group compact>
                      <Form.Item name="price" noStyle>
                        <Input
                          placeholder="Giá"
                          style={{ width: "calc(100% - 170px)", textAlign: "right" }}
                          onChange={() => handleNumberInputChange("price")}
                          type="number"
                        />
                      </Form.Item>
                      <Form.Item name="price_unit" noStyle>
                        <Select
                          placeholder="Giá"
                          style={{
                            width: "100px",
                            backgroundColor: "#f4f4f7 !important",
                          }}
                        >
                          {priceUnit?.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name="price_measure_unit" noStyle>
                        <Select placeholder="Đơn vị đo lường giá" style={{ width: 70 }}>
                          {priceMeasureUnit?.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24}>
                  <Form.Item
                    rules={[{ max: 500, message: "Ứng dụng không quá 500 kí tự" }]}
                    name="application"
                    label="Ứng dụng:"
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      placeholder="Nhập ứng dụng"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="THÔNG TIN BỔ SUNG">
              <Row gutter={50} className="material-status">
                <Col>
                  <Form.Item noStyle name="status">
                    <b className="mr10">Trạng thái:</b>
                    <Switch
                      onChange={(checked) => {
                        setStatus(checked ? "active" : "inactive");
                      }}
                      className="ant-switch-success mr10"
                      defaultChecked={false}
                    />
                  </Form.Item>
                  <label className={status === "active" ? "text-success" : "text-error"}>
                    {statusValue}
                  </label>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24}>
                  <Form.Item labelCol={{ span: 24, offset: 0 }} label="Ảnh:" colon={false}>
                    <div>Tải lên tối đa 7 ảnh, định dạng JPG/ JPEG/ PNG</div>
                    <div>Dung lượng tối đa 3 MB</div>
                    <Upload
                      fileList={fileList}
                      multiple={true}
                      maxCount={7}
                      listType="picture-card"
                      beforeUpload={(file: RcFile) => {
                        checkBeforeUpload(file, "img");
                      }}
                      onChange={(file: UploadChangeParam) => {
                        changeFile(file, "img");
                      }}
                      customRequest={(options: UploadRequestOption<any>) => {
                        customRequest(options, "img");
                      }}
                      onRemove={(data: UploadFile<any>) => {
                        checkBeforeUpload(data, "img");
                      }}
                    >
                      Chọn file ảnh
                    </Upload>
                  </Form.Item>
                  <Form.Item noStyle hidden name="images">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24}>
                  <Form.Item labelCol={{ span: 24, offset: 0 }} label="Video:" colon={false}>
                    <div>Tải lên tối đa 2 video</div>
                    <div>Dung lượng video tối đa 500 MB</div>
                    <Upload
                      fileList={fileListVideo}
                      beforeUpload={(file: RcFile) => {
                        checkBeforeUpload(file, "video");
                      }}
                      multiple={true}
                      maxCount={2}
                      onChange={(file: UploadChangeParam) => {
                        changeFile(file, "video");
                      }}
                      customRequest={(options: UploadRequestOption<any>) => {
                        customRequest(options, "video");
                      }}
                      onRemove={(data: UploadFile<any>) => {
                        removeFile(data, "video");
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file Video</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item noStyle hidden name="videos">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24}>
                  <Form.Item
                    rules={[{ max: 1000, message: "Ghi chú không quá 1000 kí tự" }]}
                    name="description"
                    label="Ghi chú:"
                  >
                    <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="Ghi chú" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space>
              <Button loading={isLoading} htmlType="submit" type="primary">
                Tạo chất liệu
              </Button>
            </Space>
          }
        />
      </Form>
      <ModalCares
        onCancel={() => setIsShowCareModal(false)}
        onOk={(data) => {
          setCareLabelsString(data);
          setIsShowCareModal(false);
        }}
        isVisible={isShowCareModal}
        careLabels={careLabelsString}
      />
    </ContentContainer>
  );
};

export default AddMaterial;
