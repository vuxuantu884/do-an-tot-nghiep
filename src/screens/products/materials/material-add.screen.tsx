import { EditOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Popover, Row, Select, Space, Switch, Upload } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import { MaterialCreateRequest } from "model/product/material.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import ModalCares from "../Component/CareInformation";
import { careInformation } from "../product/component/CareInformation/care-value";
import "./style.scss";
import { UploadFile } from "antd/es/upload/interface";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { RegUtil } from "utils/RegUtils";
import { callApiNative } from "utils/ApiUtils";
import { uploadFileApi } from "service/core/import.service";
import { createMaterialApi } from "service/product/material.service";
import SupplierSearchSelect from "component/filter/component/supplier-select";

let initialRequest: MaterialCreateRequest = {
  fabric_code: "",
  care_labels: "",
  application: "",
  code: "",
  component: "",
  description: "",
  name: "",
  advantages: "",
  defect: "",
  preserve: "",
  status: "inactive",
  fabric_size_unit: "m",
  weight_unit: "g/m2",
  price_unit: "VND",
  price_measure_unit: "m",
  videos: [],
  images: [],
  // videos: [
  //   'https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/APM5281_1657098801219.mp4',
  //   'https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/y2meta.com%20-%20Hacker%20rao%20b%C3%A1n%20d%E1%BB%AF%20li%E1%BB%87u%20c%E1%BB%A7a%20m%E1%BB%99t%20t%E1%BB%B7%20ng%C6%B0%E1%BB%9Di%20Trung%20Qu%E1%BB%91c%20_%20VTV24_1657098808220.mp4'
  // ],
  // images: [
  //   'https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/apk5177-tra-5_1657098773342.jpg',
  //   'https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/apk5177-tra-6_1657098773366.jpg'
  // ]
};

const AddMaterial: React.FC = () => {
  const marterialStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.material_status,
  );
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [showCareModal, setShowCareModal] = useState(false);
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

  const onFinish = useCallback(
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
      setLoading(true);
      await callApiNative({ isShowLoading: false }, dispatch, createMaterialApi, newValue).then(
        (res) => {
          setLoading(false);
          if (res && res.errors) {
            res.errors.forEach((e: string) => showError(e));
            return;
          } else if (res) {
            showSuccess("Thêm chất liệu thành công");
            history.push(UrlConfig.MATERIALS);
          }
        },
      );
      setLoading(false);
    },
    [careLabelsString, dispatch, form, history, status],
  );

  useEffect(() => {
    const newSelected = careLabelsString ? careLabelsString.split(";") : [];
    let careLabels: any[] = [];
    newSelected.forEach((value: string) => {
      careInformation.washing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });

      careInformation.beleaching.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.ironing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.drying.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.professionalCare.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
    });
    setCareLabels(careLabels);
  }, [careLabelsString]);

  const statusValue = useMemo(() => {
    if (!marterialStatusList) {
      return "";
    }
    let index = marterialStatusList?.findIndex((item) => item.value === status);
    if (index !== -1) {
      return marterialStatusList?.[index].name;
    }
    return "";
  }, [marterialStatusList, status]);

  const checkFile = (file: any, type: string, mess: boolean = false) => {
    let check = true;
    switch (type) {
      case "video":
        const isVideo = file.type === "video/mp4";
        if (!isVideo) {
          mess && showWarning("Vui lòng chọn đúng định dạng mp4");
          check = false;
          break;
        }
        check = file.size / 1024 / 1024 < 500;
        if (!check) {
          mess && showWarning("Cần chọn file nhỏ hơn 500mb");
          check = false;
          break;
        }
        break;
      case "img":
        const isJpgOrPng =
          file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
        if (!isJpgOrPng) {
          mess && showWarning("Vui lòng chọn đúng định dạng file JPG, PNG, JPEG");
          check = false;
          break;
        }
        check = file.size / 1024 / 1024 < 3;
        if (!check) {
          mess && showWarning("Cần chọn file nhỏ hơn 10mb");
          check = false;
          break;
        }
        break;
      default:
        break;
    }

    return check;
  };

  const onBeforeUpload = useCallback((file: any, type: string) => {
    return checkFile(file, type, true) ? true : Upload.LIST_IGNORE;
  }, []);

  const onRemoveFile = (data: UploadFile<any>, type: string) => {
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

  const onChangeFile = useCallback((info, type: string) => {
    let check = true;
    if (info.fileList) {
      info.fileList.forEach((file: any) => {
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

  const onCustomRequest = async (options: UploadRequestOption<any>, type: string) => {
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
      <Form form={form} onFinish={onFinish} initialValues={initialRequest} layout="vertical">
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
                      onClick={() => setShowCareModal(true)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={24} md={24} sm={24}>
                  <Form.Item name="advantages" label="Ưu điểm:">
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
                        <NumberInput
                          format={(a: string) => formatCurrency(a)}
                          replace={(a: string) => replaceFormatString(a)}
                          maxLength={15}
                          isFloat
                          placeholder="Khổ vải"
                          style={{ width: "calc(100% - 100px)" }}
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
                        <NumberInput
                          format={(a: string) => formatCurrency(a)}
                          replace={(a: string) => replaceFormatString(a)}
                          maxLength={15}
                          isFloat
                          placeholder="Trọng lượng"
                          style={{ width: "calc(100% - 100px)" }}
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
                        <NumberInput
                          format={(a: string) => formatCurrency(a)}
                          replace={(a: string) => replaceFormatString(a)}
                          maxLength={15}
                          isFloat
                          placeholder="Giá"
                          style={{ width: "calc(100% - 170px)" }}
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
                      beforeUpload={(file: any) => {
                        onBeforeUpload(file, "img");
                      }}
                      onChange={(file: any) => {
                        onChangeFile(file, "img");
                      }}
                      customRequest={(options: UploadRequestOption<any>) => {
                        onCustomRequest(options, "img");
                      }}
                      onRemove={(data: UploadFile<any>) => {
                        onRemoveFile(data, "img");
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file Ảnh</Button>
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
                      beforeUpload={(file: any) => {
                        onBeforeUpload(file, "video");
                      }}
                      multiple={true}
                      maxCount={2}
                      onChange={(file: any) => {
                        onChangeFile(file, "video");
                      }}
                      customRequest={(options: UploadRequestOption<any>) => {
                        onCustomRequest(options, "video");
                      }}
                      onRemove={(data: UploadFile<any>) => {
                        onRemoveFile(data, "video");
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
              <Button loading={loading} htmlType="submit" type="primary">
                Tạo chất liệu
              </Button>
            </Space>
          }
        />
      </Form>
      <ModalCares
        onCancel={() => setShowCareModal(false)}
        onOk={(data) => {
          setCareLabelsString(data);
          setShowCareModal(false);
        }}
        visible={showCareModal}
        careLabels={careLabelsString}
      />
    </ContentContainer>
  );
};

export default AddMaterial;
