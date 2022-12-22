import { CallBackProps, STATUS } from 'react-joyride';
import { Button, Table } from "antd";
import React from "react";
import ModalConfirm from "component/modal/ModalConfirm";
import { TourGuide } from "component";
import { IncurredAuditRecordType } from "model/inventoryadjustment";
import { columns } from "../IncurredRecordColumns";
import { ACTION_CALLBACK, exportExcel, goDocument } from "screens/inventory-adjustment/helper";
import { Link } from "react-router-dom";
import { DownloadOutlined, FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { StyledWrapperContentModal, StyledWrapperFooterModal } from "../../../styles";
import { ColumnsType } from "antd/lib/table";

type NoticeIncurredRecordTourProps = {
  isRun: boolean,
  setIsRun: React.Dispatch<React.SetStateAction<boolean>>,
  isVisibleModalNotice: boolean,
  setIsVisibleModalNotice: React.Dispatch<React.SetStateAction<boolean>>,
  incurredAuditRecords: Array<IncurredAuditRecordType>,
  incurredAuditRecordsMap: Map<string, Array<IncurredAuditRecordType>>,
  confirmAudit: () => void
};

type ObjRenderType = {
  children: React.ReactNode,
  props: {
    rowSpan: number
  }
};

const NoticeIncurredRecordTour = (props: NoticeIncurredRecordTourProps) => {
  const {
    isRun,
    setIsRun,
    incurredAuditRecords,
    isVisibleModalNotice,
    setIsVisibleModalNotice,
    confirmAudit,
    incurredAuditRecordsMap
  } = props;

  const steps = [
    {
      target: '.forward-step-one',
      content: <div>
        Thông báo phát sinh trong thời gian từ lúc <span className="font-weight-500">Tạo phiếu kiểm</span> đến lúc
        <span className="font-weight-500"> Hoàn thành kiểm</span>
      </div>,
      locale: {next: <span>Tiếp</span>},
      disableBeacon: true,
      placement: "right-start" as "right-start"
    },
    {
      target: '.forward-step-two',
      content: <div>
        Danh sách các phiếu, ấn vào để xem <span className="font-weight-500">Chi tiết các phiếu</span>
      </div>,
      locale: {next: <span>Tiếp</span>, back: <span>Lùi</span>},
      disableBeacon: true
    },
    {
      target: '.forward-step-three',
      content: <div>
        Ấn vào đây để <span className="font-weight-500">Ẩn thông báo</span>
      </div>,
      locale: {next: <span>Tiếp</span>, back: <span>Lùi</span>},
      disableBeacon: true
    },
    {
      target: '.forward-step-four',
      content: <div>
        Ấn vào đây để <span className="font-weight-500">Tải File Excel</span>, chứa thông tin các phiếu phát sinh
      </div>,
      locale: {next: <span>Tiếp</span>, back: <span>Lùi</span>},
      disableBeacon: true
    },
    {
      target: '.forward-step-five',
      content: <div>
        Ấn vào đây để <span className="font-weight-500">Hoàn thành kiểm</span>, nếu các phiếu phát sinh đã được xử lý
      </div>,
      locale: {next: <span>Tiếp</span>, back: <span>Lùi</span>},
      disableBeacon: true
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const {status, action} = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setIsRun(false);
      return;
    }
    switch (action) {
      case ACTION_CALLBACK.CLOSE:
      case ACTION_CALLBACK.RESET:
        setIsRun(false);
        break;
      default:
        break;
    }
  };

  const handleStartTourGuide = () => {
    setIsRun(true);
  };

  const confirmNoticeContentRender = <StyledWrapperContentModal style={{ overflow: "auto", maxHeight: "50vh" }}>
    <div className="mb-10 warning"><FileTextOutlined className="icon-warning" /> Có {[...incurredAuditRecordsMap.entries()].length} phiếu phát sinh trong quá trình kiểm kho</div>
    <Table
      bordered
      className="adjustment-inventory-table"
      columns={[
        {
          title: <span>Mã phiếu</span>,
          dataIndex: "code",
          key: "code",
          width: 100,
          render: (value: string, record: IncurredAuditRecordType, index: number) => {
            const currentValues = incurredAuditRecordsMap.get(value) || [];
            const obj: ObjRenderType = {
              children: (
                <Link
                  className={`font-weight-500 ${index === 0 ? 'forward-step-two' : ''}`}
                  target="_blank"
                  to={`${goDocument(record.document_type)}/${record.parent_document_id}`}
                >
                  {value}
                </Link>
              ),
              props: {
                rowSpan: 0
              },
            };

            if (index === 0 || (index > 0 && value !== incurredAuditRecords[index - 1].code)) {
              obj.props.rowSpan = currentValues.length;
            } else {
              obj.props.rowSpan = 0;
            }
            return obj;
          }
        },
        ...columns
      ] as ColumnsType<IncurredAuditRecordType>}
      dataSource={incurredAuditRecords}
      pagination={false}
    />
  </StyledWrapperContentModal>;

  return (
    <>
      <TourGuide
        disableScrolling
        floaterProps={{ disableAnimation: true }}
        callback={handleJoyrideCallback}
        steps={steps}
        run={isRun}
      />

      <ModalConfirm
        maskClosable={false}
        className="forward-step-one"
        width={680}
        onCancel={() => {
          setIsVisibleModalNotice(false);
        }}
        title={`Hoàn thành phiếu kiểm?`}
        isHiddenIcon
        subTitle={`Phiếu kiểm sẽ chuyển sang trạng thái "Đã kiểm" và không thể thay đổi Số lượng thực tồn.`}
        visible={isVisibleModalNotice}
        children={confirmNoticeContentRender}
        footer={
          <StyledWrapperFooterModal>
            <div className="group-btn">
              <Button
                icon={<PlayCircleOutlined />}
                type="default"
                className="btn-show-tour"
                onClick={handleStartTourGuide}
              >
                Hướng dẫn
              </Button>
              <span
                className="mr-15 forward-step-five cursor-p"
                style={{ color: "#8C8C8C" }}
                onClick={() => {
                  setIsRun(false);
                  confirmAudit();
                }}
              >
              Đã xử lý phát sinh, hoàn thành kiểm
            </span>
              <Button
                icon={<DownloadOutlined />}
                type="default"
                className="forward-step-four"
                onClick={() => exportExcel(incurredAuditRecords)}
              >
                Xuất Excel
              </Button>
              <Button
                type="primary"
                className="forward-step-three"
                onClick={() => {
                  setIsVisibleModalNotice(false);
                }}
              >
                Ẩn thông báo
              </Button>
            </div>
          </StyledWrapperFooterModal>
        }
      />
    </>
  );
};

export default NoticeIncurredRecordTour;