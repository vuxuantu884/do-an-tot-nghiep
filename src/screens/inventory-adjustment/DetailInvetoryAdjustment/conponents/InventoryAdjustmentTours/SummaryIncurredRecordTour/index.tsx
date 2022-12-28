import { CallBackProps, STATUS } from 'react-joyride';
import { Button, Table } from "antd";
import React from "react";
import ModalConfirm from "component/modal/ModalConfirm";
import { TourGuide } from "component";
import { IncurredAuditRecordType } from "model/inventoryadjustment";
import { columns } from "../IncurredRecordColumns";
import { ACTION_CALLBACK, exportExcelTwoSheet, goDocument } from "screens/inventory-adjustment/helper";
import { Link } from "react-router-dom";
import { DownloadOutlined, FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { StyledWrapperContentModal, StyledWrapperFooterModal } from "../../../styles";

type SummaryIncurredRecordTourProps = {
  isRun: boolean,
  setIsRun: React.Dispatch<React.SetStateAction<boolean>>,
  isVisibleModalSummaryNotice: boolean,
  setIsVisibleModalSummaryNotice: React.Dispatch<React.SetStateAction<boolean>>,
  incurredAuditRecords: Array<IncurredAuditRecordType>,
  incurredAuditRecordsMap: Map<string, Array<IncurredAuditRecordType>>,
  incurredAdjustRecords: Array<IncurredAuditRecordType>,
  incurredAdjustRecordsMap: Map<string, Array<IncurredAuditRecordType>>
};

type ObjRenderType = {
  children: React.ReactNode,
  props: {
    rowSpan: number
  }
};

const SummaryIncurredRecordTour = (props: SummaryIncurredRecordTourProps) => {
  const {
    isRun,
    setIsRun,
    incurredAuditRecords,
    incurredAuditRecordsMap,
    incurredAdjustRecords,
    incurredAdjustRecordsMap,
    isVisibleModalSummaryNotice,
    setIsVisibleModalSummaryNotice
  } = props;

  const steps = [
    {
      target: '.forward-step-one',
      content: <div>
        Các phiếu phát sinh trong thời gian từ lúc <span className="font-weight-500">Tạo phiếu kiểm</span> đến lúc
        <span className="font-weight-500"> Hoàn thành kiểm</span>
      </div>,
      locale: {next: <span>Tiếp</span>},
      disableBeacon: true
    },
    {
      target: '.forward-step-two',
      content: <div>
        Các phiếu phát sinh trong thời gian từ lúc <span className="font-weight-500">Hoàn thành kiểm</span> đến lúc
        <span className="font-weight-500"> Cân tồn kho</span>
      </div>,
      locale: {next: <span>Tiếp</span>},
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
    {incurredAuditRecords.length > 0 && (
      <div className="mb-10 warning"><FileTextOutlined className="icon-warning" /> Có {[...incurredAuditRecordsMap.entries()].length} phiếu phát sinh trong quá trình Hoàn thành
        kiểm</div>
    )}
    {incurredAuditRecords.length > 0 && (
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
                    className={`font-weight-500 ${index === 0 ? 'forward-step-one' : ''}`}
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
        ]}
        dataSource={incurredAuditRecords}
        pagination={false}
      />
    )}
    {incurredAdjustRecords.length > 0 && (
      <div className="mb-10 margin-top-20 warning"><FileTextOutlined className="icon-warning"  /> Có {[...incurredAdjustRecordsMap.entries()].length} phiếu phát sinh trong quá trình Cân
        tồn kho</div>
    )}
    {incurredAdjustRecords.length > 0 && (
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
              const currentValues = incurredAdjustRecordsMap.get(value) || [];
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

              if (index === 0 || (index > 0 && value !== incurredAdjustRecords[index - 1].code)) {
                obj.props.rowSpan = currentValues.length;
              } else {
                obj.props.rowSpan = 0;
              }
              return obj;
            }
          },
          ...columns
        ]}
        dataSource={incurredAdjustRecords}
        pagination={false}
      />
    )}
  </StyledWrapperContentModal>;

  return (
    <>
      <TourGuide
        disableScrolling
        floaterProps={{ disableAnimation: true }}
        callback={handleJoyrideCallback}
        steps={steps.filter((step) => {
          if (incurredAuditRecords.length === 0) {
            return step.target !== ".forward-step-one"
          }

          if (incurredAdjustRecords.length === 0) {
            return step.target !== ".forward-step-two"
          }

          return step;
        })}
        run={isRun}
      />

      <ModalConfirm
        isHiddenIcon
        maskClosable={false}
        width={680}
        onCancel={() => {
          setIsVisibleModalSummaryNotice(false);
        }}
        title={`Tổng hợp các phiếu phát sinh trong quá trình kiểm kho`}
        visible={isVisibleModalSummaryNotice}
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
              <Button
                type="default"
                icon={<DownloadOutlined />}
                className="forward-step-four"
                onClick={() => exportExcelTwoSheet(incurredAuditRecords, incurredAdjustRecords)}
              >
                Xuất Excel
              </Button>
              <Button
                type="primary"
                className="forward-step-three"
                onClick={() => {
                  setIsVisibleModalSummaryNotice(false);
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

export default SummaryIncurredRecordTour;