import { UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Modal, Row, Upload } from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
import { VariantImage } from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import "./index.scss"
import { useDispatch } from "react-redux";
import { callApiNative } from "utils/ApiUtils";
import { producImagetUploadApi } from "service/product/product.service";
import { HttpStatus } from "config/http-status.config";


type ModalPickAvatarProps = {
  visible: boolean;
  variantImages: Array<VariantImage>;
  onCancel: () => void;
  onOk: (imageId: number|undefined,isReload?: boolean) => void;
  productId: number| undefined
};

const ModalUploadImages: React.FC<ModalPickAvatarProps> = (
  props: ModalPickAvatarProps
) => {
  const dispatch = useDispatch();
  const { visible, variantImages, productId,onCancel, onOk } = props;
  const [selected, setSelected] = useState<number|undefined>(-1);
  const [fireLists, setFireLists] = useState<Array<UploadFile>>([]);
  const [loadingConfirm, setLoadingConfirm] = useState<boolean>(false);

  const onCancelClick = useCallback(() => {
    setFireLists([]);
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(async () => {
    let isReload = false;
    if (fireLists && fireLists.length > 0) {
      let files: Array<File> = [];
      for (let i = 0; i < fireLists.length; i++) {
        const e:any = fireLists[i].originFileObj as Blob;
        files.push(e);
      }
      setLoadingConfirm(true);
      const res = await callApiNative({isShowLoading: false}, dispatch, producImagetUploadApi, files ,"variant", productId);
      setLoadingConfirm(false);
      
      if (!res || res.code !== HttpStatus.SUCCESS) {
        if (res.errors && res.errors.length > 0) {
          res.errors.forEach((e: string) => showError(e));
          return;
        }
        showSuccess("Thêm ảnh thành công");
        isReload= true;
      }
    }
    onOk(selected,isReload); 
    setFireLists([]);
  }, [fireLists, dispatch, productId, onOk, selected]);
  const avatar = useMemo(() => {
    let index = variantImages.findIndex((item) => item.id === selected);
    return index === -1 ? "" : variantImages[index].url;
  }, [selected, variantImages]);

  const beforeUpload = useCallback((file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      showWarning("Vui lòng chọn đúng định dạng file JPG, PNG");
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      showWarning("Cần chọn ảnh nhỏ hơn 5mb");
    }
    return isJpgOrPng && isLt2M ? true : Upload.LIST_IGNORE;
  }, []);

  const onAddFiles = useCallback((info) => {  
    setFireLists(info.fileList);
  }, []);

  useEffect(() => {
    if (visible) {
      variantImages.forEach((item, index) => {
        if (item.product_avatar) {
          setSelected(item.id);
        }
      });
    }
  }, [variantImages, visible]);

  return (
    <Modal
      onOk={onOkClick}
      confirmLoading={loadingConfirm}
      onCancel={onCancelClick}
      title="Ảnh sản phẩm"
      width={900}
      visible={visible}
      className="modal-image"
    >
      <Row gutter={24}>
        <Col span={24} md={7}>
          <div className="avatar-show">
            {avatar ? <img src={avatar} alt="" /> : <img src={variantdefault} alt="" />}
          </div>
          <Upload
           style={{width: "100%"}}
           multiple
           fileList={fireLists}
           beforeUpload={beforeUpload}
           onChange={(info) => {
            onAddFiles(info);}}
           className="image-product"
           listType="text" 
           customRequest={(options) => {
          }}
         >
           <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
         </Upload>
        </Col>
        <Col span={24} md={17}>
          <div className="avatar-list">
            {variantImages.map((item: VariantImage) => (
              <div
                className="img-frame"
                onClick={(e) => {
                  setSelected(item.id);
                }}
              >
                <img src={item.url} alt="" />
                <Checkbox checked={item.id === selected} className="av-checkbox" />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalUploadImages;
