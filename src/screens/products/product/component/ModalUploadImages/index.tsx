import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Modal, Row, Upload } from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
import { VariantImage } from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { RcFile } from "antd/lib/upload/interface";
import "./index.scss";
import { useDispatch } from "react-redux";
import { callApiNative } from "utils/ApiUtils";
import { producImagetUploadApi } from "service/product/product.service";
import { HttpStatus } from "config/http-status.config";

type ModalPickAvatarProps = {
  visible: boolean;
  variantImages: Array<VariantImage>;
  onCancel: () => void;
  onOk: (imageId: number | undefined, isReload?: boolean) => void;
  productId: number | undefined;
};

const ModalUploadImages: React.FC<ModalPickAvatarProps> = (props: ModalPickAvatarProps) => {
  const dispatch = useDispatch();
  const { visible, variantImages, productId, onCancel, onOk } = props;
  const [selected, setSelected] = useState<number | undefined>(-1);
  const [fileList, setFileList] = useState<any>([]);
  const [loadingConfirm, setLoadingConfirm] = useState<boolean>(false);

  const onCancelClick = useCallback(() => {
    setFileList([]);
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(async () => {
    let isReload = false;
    if (fileList && fileList?.length > 0) {
      let files: Array<File> = [];
      for (let i = 0; i < fileList.length; i++) {
        const e: any = fileList[i].originFileObj as Blob;
        files.push(e);
      }
      setLoadingConfirm(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        producImagetUploadApi,
        files,
        "variant",
        productId,
      );
      setLoadingConfirm(false);
      if (!res || res.code !== HttpStatus.SUCCESS) {
        if (res.message) {
          const dataErrors = res.data;

          const newFileListError = fileList.map((file: any) => {
            const errorFiltered = dataErrors.filter((error: any) => error.indexOf(file.name) !== -1);
            return {
              ...file,
              error: errorFiltered && errorFiltered.length > 0 ? errorFiltered[0].slice(0, errorFiltered[0].indexOf(file.name) - 2) : null
            }
          });

          setFileList(newFileListError);

          return;
        }
        showSuccess("Thêm ảnh thành công");
        isReload = true;
      }
    }
    onOk(selected, isReload);
    setFileList([]);
  }, [fileList, dispatch, productId, onOk, selected]);
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
    setFileList(info.fileList);
  }, []);

  const removeFile = useCallback((file) => {
    const newFiles = fileList.filter((i: any) => i.uid !== file.uid)
    setFileList(newFiles);
  }, [fileList]);

  useEffect(() => {
    if (visible) {
      variantImages.forEach((item) => {
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
            style={{ width: "100%" }}
            multiple
            fileList={fileList}
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={(info) => {
              onAddFiles(info);
            }}
            className="image-product"
            listType="text"
            customRequest={() => {}}
          >
            <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
          </Upload>
          {fileList.length > 0 && fileList.map((file: any) => {
            return (
              <div className={`file-list mt-10 ${file.error ? 'error-file' : ''}`}>
                <div className="margin-right-10">
                  {file.name} {file.error && `(${file.error})`}
                </div>
                <div onClick={() => removeFile(file)}>
                  <DeleteOutlined />
                </div>
              </div>
            )
          })}
        </Col>
        <Col span={24} md={17}>
            {variantImages.length !== 0 ? (
            <div className="avatar-list">
              {variantImages.map((item: VariantImage) => (
                <div
                  className="img-frame"
                  onClick={() => {
                    setSelected(item.id);
                  }}
                >
                  <img src={item.url} alt="" />
                  <Checkbox checked={item.id === selected} className="av-checkbox" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="font-weight-500">Lưu ý:</div>
              <div className="note">
                <div>1. Cần đặt tên file ảnh theo đúng mã SKU của sản phẩm để cập nhật ảnh có SKU tương ứng. </div>
                <div>2. Tên file ảnh là Mã 7 + màu thì sản phẩm có mã 7 và màu tương ứng sẽ được cập nhật ảnh.</div>
                <div>Ví dụ: Tên file: APN1234-TIT.png thì tất cả sản phẩm có SKU tương ứng như APN1234-TIT-S; APN1234-TIT-M,… sẽ được cập nhật.</div>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalUploadImages;
