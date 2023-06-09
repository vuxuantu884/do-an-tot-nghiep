import { EditOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Popover, Row, Select, Switch, Upload } from "antd";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import { detailMaterialAction } from "domain/actions/product/material.action";
import { MaterialResponse, MaterialUpdateRequest } from "model/product/material.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { callApiNative } from "utils/ApiUtils";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import ModalCares from "../component/CareInformation";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import "./style.scss";
import { updateMaterialApi } from "service/product/material.service";
import { backAction, checkFile, convertLabelSelected, validateNumberValue } from "screens/products/helper";
import { RuleObject, StoreValue } from "rc-field-form/lib/interface";
import { UploadChangeParam } from "antd/lib/upload";

type MaterialParam = {
  id: string;
};

const UpdateMaterial: React.FC = () => {
  const { id } = useParams<MaterialParam>();
  const [oldData, setData] = useState<MaterialUpdateRequest | null>(null);
  const [isLoadData, setLoadData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [isShowCareModal, setIsShowCareModal] = useState(false);
  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");
  const [status, setStatus] = useState<string>(oldData?.status ?? "inactive");

  const fabricSizeUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.fabric_size_unit,
  );
  const weightUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_material_unit,
  );
  const priceUnit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.currency);
  const materialStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.material_status,
  );
  const priceMeasureUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.price_measure_unit,
  );
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [fileListVideo, setFileListVideo] = useState<Array<UploadFile>>([]);

  const updateMaterial = useCallback(
    async (values: MaterialUpdateRequest) => {
      const idNumber = parseInt(id);
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
      await callApiNative(
        { isShowLoading: false },
        dispatch,
        updateMaterialApi,
        idNumber,
        newValue,
      ).then((res) => {
        setLoading(false);
        if (res && res.errors) {
          res.errors.forEach((e: string) => showError(e));
          return;
        } else if (res) {
          showSuccess("Cập nhật chất liệu thành công");
          history.push(UrlConfig.MATERIALS);
        }
      });
      setLoading(false);
    },
    [careLabelsString, dispatch, form, history, id, status],
  );

  const onGetDetail = useCallback(
    (material: MaterialResponse | false) => {
      setLoadData(false);
      if (!material) {
        setError(true);
      } else {
        if (material.supplier_ids) {
          const supplierIdsStr: any = material.supplier_ids;
          let lst: Array<number> = [];
          supplierIdsStr.split(",").forEach((element: string) => {
            lst.push(parseInt(element));
          });
          material.supplier_ids = lst;
        }
        setData(material);
        setStatus(material.status);
        setCareLabelsString(material.care_labels);
        const listFile: any = material.images?.map((item: string) => {
          return {
            name: item,
            url: item,
          };
        });
        setFileList(listFile);
        const fileCurrent = listFile?.map((item: any) => item.url);
        form.setFieldsValue({ images: fileCurrent });
        const listVideos: any = material.videos?.map((item: string) => {
          return {
            name: item,
            url: item,
          };
        });
        setFileListVideo(listVideos);
        const fileCurrentVideos = listVideos?.map((item: any) => item.url);
        form.setFieldsValue({ videos: fileCurrentVideos });
      }
    },
    [form],
  );

  useEffect(() => {
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, onGetDetail));
    }
  }, [dispatch, id, onGetDetail]);

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

  const handleNumberInputChange = (name: "price" | "fabric_size" | "weight") => {
    const vl: string = form.getFieldValue(name).toString();
    form.setFields([{ ...validateNumberValue(vl), name }]);
  };

  const handleBeforeUpload = useCallback((file: RcFile, type: string) => {
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
          debugger;
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

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoadData}
      title="Sửa chất liệu"
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
          name: oldData !== null ? oldData.name : "",
        },
      ]}
    >
      {oldData && (
        <Form form={form} onFinish={updateMaterial} initialValues={oldData} layout="vertical">
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
                          "Mã chất liệu chỉ bao gồm ký tự in hoa hoặc số viết liền không dấu, không bao gồm ký tự đặc biệt",
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
                          message: "Mã không đúng định dạng",
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn nhà cung cấp",
                        },
                      ]}
                      name="supplier_ids"
                      mode="multiple"
                      help={false}
                      maxTagCount="responsive"
                      supplier_ids={oldData.supplier_ids}
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
                            style={{ width: "calc(100% - 170px)", textAlign: "right" }}
                            placeholder="Khổ vải"
                            onChange={() => handleNumberInputChange("fabric_size")}
                            type="number"
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
                            type="number"
                            placeholder="Trọng lượng"
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
                            style={{ width: "calc(100% - 170px)", textAlign: "right" }}
                            placeholder="Giá"
                            onChange={() => handleNumberInputChange("price")}
                            type="number"
                          />
                        </Form.Item>
                        <Form.Item name="price_unit" noStyle>
                          <Select placeholder="Giá" style={{ width: "100px" }}>
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
                        checked={status === "active"}
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
                          handleBeforeUpload(file, "img");
                        }}
                        onChange={(file: UploadChangeParam) => {
                          changeFile(file, "img");
                        }}
                        customRequest={(options: UploadRequestOption<any>) => {
                          customRequest(options, "img");
                        }}
                        onRemove={(data: UploadFile<any>) => {
                          removeFile(data, "img");
                        }}
                      >
                        Chọn file Ảnh
                      </Upload>
                    </Form.Item>
                    <Form.Item noStyle hidden name="images">
                      <Input />
                    </Form.Item>
                    <Form.Item noStyle name="version" hidden>
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
                          handleBeforeUpload(file, "video");
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
            backAction={() => backAction(form.getFieldsValue(), oldData, setModalConfirm, history, UrlConfig.CATEGORIES)}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.materials_update]}>
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </AuthWrapper>
            }
          />
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
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

export default UpdateMaterial;
