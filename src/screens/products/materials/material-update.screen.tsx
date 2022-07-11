import { EditOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Popover, Row, Select, Switch, Upload} from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import NumberInput from "component/custom/number-input.custom";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import {
  detailMaterialAction,
} from "domain/actions/product/material.action";
import {
  MaterialResponse,
  MaterialUpdateRequest,
} from "model/product/material.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { CompareObject } from "utils/CompareObject";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import ModalCares from "../Component/CareInformation";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { careInformation } from "../Component/CareInformation/care-value";
import './style.scss';
import { updateMaterialApi } from "service/product/material.service";

type MaterialPamram = {
  id: string;
};

const UpdateMaterial: React.FC = () => {
  const { id } = useParams<MaterialPamram>();
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
  
  const [showCareModal, setShowCareModal] = useState(false);
  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");
  const [status, setStatus] = useState<string>(oldData?.status ?? "inactive");
  
  const fabricSizeUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.fabric_size_unit
  );
  const weightUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_material_unit
  );
  const priceUnit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.currency
  );
  const marterialStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.material_status
  );
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [fileListVideo, setFileListVideo] = useState<Array<UploadFile>>([]);

  const onFinish = useCallback(
    async (values: MaterialUpdateRequest) => {
      let idNumber = parseInt(id);
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
      await callApiNative({isShowLoading: false},dispatch,updateMaterialApi,idNumber,newValue).then(
       (res) => {
        setLoading(false);
        if (res && res.errors) {
            res.errors.forEach((e: string) => showError(e));
          return
        }else if(res){
          showSuccess("Cập nhật chất liệu thành công");
          history.push(UrlConfig.MATERIALS);
        }
       }
      );
      setLoading(false);
    },
    [careLabelsString, dispatch, form, history, id, status]
  ); 

  const onGetDetail = useCallback((material: MaterialResponse | false) => {
    setLoadData(false);
    if (!material) {
      setError(true);
    } else {
      if (material.supplier_ids) {
        const supplierIdsStr:any = material.supplier_ids;
        let lst:Array<number> =[];
        supplierIdsStr.split(',').forEach((element:string) => {
          lst.push(parseInt(element));
        });
        material.supplier_ids=lst;
      }    
      setData(material);
      setStatus(material.status);
      setCareLabelsString(material.care_labels);
      const listFile: any = material.images?.map((item: string ) => {
        return {
          name: item,
          url: item,
        }
      });
      setFileList(listFile);
      const fileCurrent = listFile?.map((item: any) => item.url);
      form.setFieldsValue({ images: fileCurrent });
      const listVideos: any = material.videos?.map((item: string ) => {
        return {
          name: item,
          url: item,
        }
      });
      setFileListVideo(listVideos);
      const fileCurrentVideos = listVideos?.map((item: any) => item.url);
      form.setFieldsValue({ videos: fileCurrentVideos });
    }
  }, [form]);

  const backAction = ()=>{ 
    if (!CompareObject(form.getFieldsValue(),oldData)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.goBack();
    }
  };

  useEffect(() => {
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, onGetDetail));
    }
  }, [dispatch, id, onGetDetail]);

  useEffect(() => {
    const newSelected = careLabelsString ? careLabelsString.split(";") : [];
    let careLabels: any[] = []
    newSelected.forEach((value: string) => {
      careInformation.washing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });

      careInformation.beleaching.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.ironing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.drying.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.professionalCare.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });

    })
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

  const checkFile = (file:any,type:string,mess: boolean=false)=>{
    let check = true;
    switch (type) {
      case "video":
        const isVideo= file.type === 'video/mp4';
        if (!isVideo) {
          mess && showWarning('Vui lòng chọn đúng định dạng mp4');
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
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
          mess && showWarning('Vui lòng chọn đúng định dạng file JPG, PNG, JPEG');
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
  }

  const onBeforeUpload = useCallback((file:any,type:string) => {    
    return checkFile(file,type,true) ? true : Upload.LIST_IGNORE;
  }, []);

  const onRemoveFile = (data: UploadFile<any>,type: string) => {
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
          form.setFieldsValue({images: newFileCurrent});
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
          form.setFieldsValue({videos: newFileCurrent});
        }
        setFileListVideo([...fileListVideo]);
          break
      default:
        break;
    }
    
  };

  const onChangeFile = useCallback((info, type: string) => {
    if (type ==="video") {
      setFileListVideo(info.fileList);
    }else{
      setFileList(info.fileList);
    }
  }, []);

  const onCustomRequest = async (options: UploadRequestOption<any>,type: string) => {
    const {file} = options;
    if (!checkFile(file,type)) return;

    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      if (type==="video") {
        await callApiNative({isShowLoading: false},dispatch,uploadFileApi,files,"material-info").then(
          (data: false | Array<string>)=>{
            let index = fileListVideo.findIndex((item) => item.uid === uuid);
            if (!!data) {
              if (index !== -1) {
                fileListVideo[index].status = "done";
                fileListVideo[index].url = data[0];
                let fileCurrent: Array<string> = form.getFieldValue("videos");
                if (!fileCurrent) {
                  fileCurrent = [];
                }
                let newFileCurrent = [
                  ...fileCurrent,
                  data[0]
                ];
                form.setFieldsValue({videos: newFileCurrent});
              }
            } else {
              fileListVideo.splice(index, 1);
              showError("Upload video không thành công");
            }
            setFileListVideo([...fileListVideo]);
          } 
        );
      }else{
        await callApiNative({isShowLoading: false},dispatch,uploadFileApi,files,"material-info").then(
          (data: false | Array<string>)=>{
            debugger
            let index = fileList.findIndex((item) => item.uid === uuid);
            if (!!data) {
              if (index !== -1) {
                fileList[index].status = "done";
                fileList[index].url = data[0];
                let fileCurrent: Array<string> = form.getFieldValue("images");
                if (!fileCurrent) {
                  fileCurrent = [];
                }
                let newFileCurrent = [
                  ...fileCurrent,
                  data[0]
                ];
                form.setFieldsValue({images: newFileCurrent});
              }
            } else {
              fileList.splice(index, 1);
              showError("Upload ảnh không thành công");
            }
            setFileList([...fileList]);
          }
        );
      }
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
        <Form
        form={form}
        onFinish={onFinish}
        initialValues={oldData}
        layout="vertical"
      >
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
                label="Mã chất liệu:"
              >
                <Input disabled placeholder="Tự động sinh" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={12} md={12} sm={24}>
              <Form.Item
                  tooltip={{
                    title: "Ký hiệu chỉ bao gồm ký tự in hoa hoặc số viết liền không dấu, không bao gồm ký tự đặc biệt",
                    icon: <InfoCircleOutlined />,
                  }}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập ký hiệu",
                    },
                    {
                      pattern: RegUtil.NO_SPECICAL_CHARACTER,
                      message: "Ký hiệu không đúng định dạng",
                    },
                  ]}
                  name="symbol"
                  label="Ký hiệu:"
                  normalize={(value: string) => (value || "").toUpperCase()}
                >
                <Input placeholder="Nhập ký hiệu"/>
              </Form.Item>
            </Col>
            <Col span={24} lg={12} md={12} sm={24}>
              <Form.Item
                  name="supplier_ids"
                  label="Nhà cung cấp:"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhà cung cấp",
                    },
                  ]}
                >
               <SupplierSearchSelect
                  noStyle
                  label={false}
                  name="supplier_ids"
                  mode="multiple"
                  help={false}
                  maxTagCount="responsive"
                  supplier_ids={oldData.supplier_ids}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={12} md={12} sm={24}>
              <Form.Item
                name="component"
                label="Thành phần:"
                rules={[{ max: 250, message: "Thành phần không quá 250 kí tự" }]}
              >
                <Input placeholder="Nhập thành phần" />
              </Form.Item>
            </Col>
            <Col span={24} lg={12} md={12} sm={24}>
              <Form.Item 
                name="preserve"
                label="Thông tin bảo quản:"
              >
                {careLabels.map((item: any) => (
                    <Popover content={item.name}>
                      <span className={`care-label ydl-${item.value}`}></span>
                    </Popover>
                  ))}
                  <Button
                    className={`button-plus`}
                    icon={careLabelsString && careLabelsString.length > 0 ? <EditOutlined /> : <PlusOutlined />}
                    onClick={() => setShowCareModal(true)}
                  />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={24} md={24} sm={24}>
              <Form.Item
                name="advantages"
                label="Ưu điểm:"
              >
               <CustomEditor />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={24} md={24} sm={24}>
                <Form.Item
                  name="defect"
                  label="Khuyến cáo:"
                >
                  <CustomEditor />
                </Form.Item>
             </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} md={8} sm={8} lg={8}>
               <Form.Item
                 label="Khổ vải:"
               >
                 <Input.Group compact>
                   <Form.Item
                     name="fabric_size"
                     noStyle
                   >
                     <NumberInput
                       format={(a: string) => formatCurrency(a)}
                       replace={(a: string) =>
                         replaceFormatString(a)
                       }
                       maxLength={15}
                       isFloat
                       placeholder="Khổ vải"
                       style={{ width: "calc(100% - 100px)" }}
                     />
                   </Form.Item>
                   <Form.Item name="fabric_size_unit" noStyle>
                     <Select
                       placeholder="Đơn vị"
                       style={{ width: "100px" }}
                     >
                       {fabricSizeUnit?.map((item) => (
                         <Select.Option
                           key={item.value}
                           value={item.value}
                         >
                           {item.name}
                         </Select.Option>
                       ))}
                     </Select>
                   </Form.Item>
                 </Input.Group>
               </Form.Item>
            </Col>
            <Col span={24} md={8} sm={8} lg={8}>
            <Form.Item
                 label="Trọng lượng:"
               >
                 <Input.Group compact>
                   <Form.Item
                     name="weight"
                     noStyle
                   >
                     <NumberInput
                       format={(a: string) => formatCurrency(a)}
                       replace={(a: string) =>
                         replaceFormatString(a)
                       }
                       maxLength={15}
                       isFloat
                       placeholder="Trọng lượng"
                       style={{ width: "calc(100% - 100px)" }}
                     />
                   </Form.Item>
                   <Form.Item name="weight_unit" noStyle>
                     <Select
                       placeholder="Trọng lượng"
                       style={{ width: "100px" }}
                     >
                       {weightUnit?.map((item) => (
                         <Select.Option
                           key={item.value}
                           value={item.value}
                         >
                           {item.name}
                         </Select.Option>
                       ))}
                     </Select>
                   </Form.Item>
                 </Input.Group>
               </Form.Item>         
            </Col>
            <Col span={24} md={8} sm={8} lg={8}>
            <Form.Item
                 label="Giá:"
               >
                 <Input.Group compact>
                   <Form.Item
                     name="price"
                     noStyle
                   >
                     <NumberInput
                       format={(a: string) => formatCurrency(a)}
                       replace={(a: string) =>
                        replaceFormatString(a)
                      }
                       maxLength={15}
                       isFloat
                       placeholder="Giá"
                       style={{ width: "calc(100% - 100px)" }}
                     />
                   </Form.Item>
                   <Form.Item name="price_unit" noStyle>
                     <Select
                       placeholder="Giá"
                       style={{ width: "100px" }}
                     >
                       {priceUnit?.map((item) => (
                         <Select.Option
                           key={item.value}
                           value={item.value}
                         >
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
                  <label
                    className={
                      status === "active" ? "text-success" : "text-error"
                    }
                  >
                    {statusValue}
                  </label>
               </Col>
             </Row>
             <Row gutter={50}>
                <Col span={24} lg={24}>
                  <Form.Item
                    labelCol={{span: 24, offset: 0}}
                    label="Ảnh:"
                    colon={false}
                  >
                    <div>Tải lên tối đa 7 ảnh, định dạng JPG/ JPEG/ PNG</div>
                    <div>Dung lượng tối đa 3 MB</div>
                    <Upload
                      fileList={fileList}
                      multiple={true}
                      maxCount={7}
                      beforeUpload={(file:any)=>{onBeforeUpload(file,"img")}}
                      onChange={(file:any)=>{onChangeFile(file,"img")}}
                      customRequest={(options: UploadRequestOption<any>)=>{onCustomRequest(options,"img")}}
                      onRemove={(data: UploadFile<any>)=>{onRemoveFile(data,"img")}}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file Ảnh</Button>
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
                  <Form.Item
                    labelCol={{span: 24, offset: 0}}
                    label="Video:"
                    colon={false}
                  >
                    <div>Tải lên tối đa 2 video</div>
                    <div>Dung lượng video tối đa 500 MB</div>
                    <Upload
                      fileList={fileListVideo}
                      beforeUpload={(file:any)=>{onBeforeUpload(file,"video")}}
                      multiple={true}
                      maxCount={2}
                      onChange={(file:any)=>{onChangeFile(file,"video")}}
                      customRequest={(options: UploadRequestOption<any>)=>{onCustomRequest(options,"video")}}
                      onRemove={(data: UploadFile<any>)=>{onRemoveFile(data,"video")}}
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
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    placeholder="Ghi chú"
                  />
                </Form.Item>
              </Col>
           </Row>     
          </Card>
        </Col>
        </Row>
        <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={backAction}
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

export default UpdateMaterial;
