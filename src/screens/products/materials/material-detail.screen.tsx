import { Button, Card, Col, Image, Modal, Popover, Row, Switch } from "antd";
import { Link } from "react-router-dom";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  detailMaterialAction,
  updateMaterialOtherAction,
} from "domain/actions/product/material.action";
import { MaterialResponse } from "model/product/material.model";
import { careInformation } from "../product/component/CareInformation/care-value";
import "./material-detail.styles.scss";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import { EditOutlined } from "@ant-design/icons";
import { showSuccess } from "utils/ToastUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { formatCurrency } from "../../../utils/AppUtils";
import useAuthorization from "hook/useAuthorization";

type MaterialPamram = {
  id: string;
};

const MaterialDetail: React.FC = () => {
  const { id } = useParams<MaterialPamram>();
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<MaterialResponse | null>(null);

  const onGetDetail = useCallback((material: any) => {
    setData(material);
  }, []);

  useEffect(() => {
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, onGetDetail));
    }
  }, [dispatch, id, onGetDetail]);

  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [videoSelected, setVideoSelected] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  let videoRef: any = useRef();
  const [canUpdateMaterials] = useAuthorization({
    acceptPermissions: [ProductPermission.materials_update],
  });

  useEffect(() => {
    if (!data) return;
    const newSelected = data?.care_labels ? data?.care_labels.split(";") : [];
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
  }, [data, data?.care_labels]);

  const onUpdate = useCallback(
    (material: MaterialResponse | false) => {
      if (!!material) {
        setData(material);
        showSuccess("Cập nhật trạng thái thành công.");
      }
    },
    []
  );

  const updateStatus = (e: any) => {
    const newValue: any = {
      description: data?.description,
      status: e ? 'active' : 'inactive'
    }
    dispatch(updateMaterialOtherAction(id, newValue, onUpdate));
  };

  const hideModal = () => {
    setVisible(false);
    setVideoSelected(null);
  };

  const openModalVideo = (videoUrl: string) => {
    setVisible(true);
    setVideoSelected(videoUrl);
  };

  const pause = () => {
    videoRef.current.pause();
    setVideoSelected(null);
  };

  return (
    <ContentContainer
      title={`${data?.name}`}
      breadcrumb={[
        {
          name: "Sản phẩm",
        },
        {
          name: "Thuộc tính",
        },
        {
          name: "Chất liệu",
          path: `${UrlConfig.MATERIALS}`,
        },
        {
          name: "Xem chất liệu",
        },
      ]}
    >
      {data !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col span={24} md={16}>
              <Card
                title="Thông tin chất liệu"
              >
                <Row gutter={50} className="mb-10">
                  <Col span={24} md={12}>
                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Mã chất liệu:</Col>
                      <Col span={16}>
                        <div className="content">{data.code}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Ký hiệu:</Col>
                      <Col span={16}>
                        <div className="content">{data.symbol}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Tên chất liệu:</Col>
                      <Col span={16}>
                        <div className="content">{data.name}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Khổ vải:</Col>
                      <Col span={16}>
                        <div className="content">{formatCurrency(data.fabric_size)} {data.fabric_size ? data.fabric_size_unit : ''}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Trọng lượng:</Col>
                      <Col span={16}>
                        <div className="content">{formatCurrency(data.weight)} {data.weight ? data.weight_unit : ''}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Giá:</Col>
                      <Col span={16}>
                        <div className="content">{formatCurrency(data.price)} {data.price ? data.price_unit : ''}</div>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24} md={12}>
                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Nhà cung cấp:</Col>
                      <Col span={16}>
                        {data.suppliers?.length && data.suppliers.map((i) => {
                          return (
                            <div>
                              <Link className="font-weight-500" to={`${UrlConfig.SUPPLIERS}/${i.id}`}>{i.name}</Link>
                            </div>
                          );
                        })}
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Thành phần:</Col>
                      <Col span={16}>
                        <div className="content">{data.component}</div>
                      </Col>
                    </Row>

                    <Row gutter={30} className="margin-bottom-15">
                      <Col className="title" span={8}>Thông tin bảo quản:</Col>
                      <Col span={16}>
                        <div>
                          <div>{careLabels.map((item: any) => (
                            <Popover key={item.value} content={item.name}>
                              <span className={`care-label ydl-${item.value}`} />
                            </Popover>
                          ))}</div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row gutter={50} className="margin-bottom-15 margin-top-40">
                  <Col span={24}>
                    <Row>
                      <Col className="title" span={4}>Ưu điểm:</Col>
                      <Col span={20}>
                        <div
                          className="content-des"
                          dangerouslySetInnerHTML={{
                            __html: data.advantages,
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row gutter={50} className="margin-bottom-15">
                  <Col span={24}>
                    <Row gutter={24}>
                      <Col className="title" span={4}>Khuyến cáo:</Col>
                      <Col span={20}>
                        <div
                          className="content-des"
                          dangerouslySetInnerHTML={{
                            __html: data.defect,
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24}>
                    <Row gutter={24}>
                      <Col className="title" span={4}>Ứng dụng:</Col>
                      <Col span={20}>
                        <div
                          className="content-des"
                          dangerouslySetInnerHTML={{
                            __html: data.application,
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24} md={8}>
              <Card title="Thông tin bổ sung" className="card">
                <div className="mb-20">
                  <span className="content">Trạng thái:</span> {data.status === "active"
                  ? <span className="text-success">Sử dụng</span>
                  : <span className="text-error">Ngừng sử dụng</span>}
                  {canUpdateMaterials && <Switch size="small" style={{ float: "right", marginTop: 3 }} checked={data.status === "active"}
                          onChange={updateStatus} />}
                </div>
                <Row gutter={24} className="margin-bottom-15">
                  <Col span={24} md={12} className="title">
                    Ghi chú:
                  </Col>
                  <Col span={24} md={12} className="content">
                    {data.description}
                  </Col>
                </Row>

                <Row gutter={24} className="margin-bottom-15">
                  <Col span={24} md={12} className="title">
                    Người tạo:
                  </Col>
                  <Col span={24} md={12}>
                    <Link className="font-weight-500" to={`${UrlConfig.ACCOUNTS}/${data.created_by}`}>
                      {data.created_by} - {data.created_name}
                    </Link>
                  </Col>
                </Row>

                <Row gutter={24} className="margin-bottom-15">
                  <Col span={24} md={12} className="title">
                    Ngày tạo:
                  </Col>
                  <Col span={24} md={12} className="content">
                    {ConvertUtcToLocalDate(data.created_date, DATE_FORMAT.DDMMYYY)}
                  </Col>
                </Row>

                <Row gutter={24} className="margin-bottom-15">
                  <Col span={24} md={12} className="title">
                    Người sửa lần cuối:
                  </Col>
                  <Col span={24} md={12}>
                    <Link className="font-weight-500" to={`${UrlConfig.ACCOUNTS}/${data.created_by}`}>
                      {data.updated_by} - {data.updated_name}
                    </Link>
                  </Col>
                </Row>

                <Row gutter={24} className="margin-bottom-15">
                  <Col span={24} md={12} className="title">
                    Ngày sửa lần cuối:
                  </Col>
                  <Col span={24} md={12} className="content">
                    {ConvertUtcToLocalDate(data.updated_date, DATE_FORMAT.DDMMYYY)}
                  </Col>
                </Row>

                <div className="font-weight-500">Hình ảnh</div>
                <div className="images">
                 <Image.PreviewGroup>
                    {data?.images?.length > 0 && data.images.map((i) => {
                      return (
                        <div style={{ marginRight: 5 }}>
                          <Image className="material-img" src={i} />
                        </div>
                      );
                    })}
                  </Image.PreviewGroup>
                </div>

                <div className="font-weight-500">Video</div>
                <div className="videos">
                  {data?.videos?.length > 0 && data.videos.map((i) => {
                    return (
                      <div className="video">
                        <video
                          onClick={() => openModalVideo(i)}
                          style={{ width: 100, height: 100, cursor: "pointer" }}
                          src={i}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>

          <Modal
            title="Video chất liệu"
            visible={visible}
            footer={null}
            onCancel={hideModal}
            afterClose={pause}
            bodyStyle={{ padding: 0 }}
          >
            {/*@ts-ignore*/}
            <Player
              key={videoSelected}
              ref={videoRef}
              autoPlay
            >
              <source
                src={videoSelected}
                type="video/mp4"
              />
            </Player>
          </Modal>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại"
        rightComponent={
          <AuthWrapper acceptPermissions={[ProductPermission.materials_update]}>
            <div>
              <Button
                onClick={() => history.push(`${UrlConfig.MATERIALS}/${id}/update`)}
                icon={<EditOutlined />}
              >
                Chỉnh sửa
              </Button>
            </div>
          </AuthWrapper>
        }
      />
    </ContentContainer>
  );
};

export default MaterialDetail;
