import { Button, Card, Dropdown, Menu, Tabs } from 'antd'
import color from 'assets/css/export-variable.module.scss'
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg"
import { ReactComponent as EditIcon } from "assets/icon/edit.svg"
import MoreAction from "assets/icon/more-action.svg"
import { ReactComponent as CycleIcon } from "assets/icon/return.svg"
import ContentContainer from 'component/container/content.container'
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm'
import CustomTable from 'component/table/CustomTable'
import TagStatus from 'component/tag/tag-status'
import UrlConfig from 'config/url.config'
import { WarrantyStatus } from 'model/warranty/warranty.model'
import React, { useRef } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { Link, useHistory } from 'react-router-dom'
import FeeModal from './components/fee-modal'
import NoteModal from './components/note-modal'
import WarrantyStatusModal from './components/status-modal'
import { WarrantyHistoryListStyle } from './index.style'
const { TabPane } = Tabs;
const TAB_STATUS = [
  {
    key: WarrantyStatus.NEW,
    name: "Mới"
  },
  {
    key: WarrantyStatus.FINALIZED,
    name: "Xác nhận"
  },
  {
    key: WarrantyStatus.FINISH,
    name: "Hoàn thành"
  }
]
type Props = {}

function WarrantyHistotyList(props: Props) {
  const history = useHistory();
  const rowSelected = useRef<{ record: any, index: number }>();
  const [isFeeModalVisible, setIsFeeModalVisible] = React.useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = React.useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = React.useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = React.useState(false);
  const rowClicked = (record: any, index: number) => {
    rowSelected.current = { record, index };
  }

  const handleOkFeeModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsFeeModalVisible(false);
    console.log(rowSelected.current)
  }

  const handleOkNoteModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsNoteModalVisible(false);
    console.log(rowSelected.current)
  }

  const handleOkStatusModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsStatusModalVisible(false);
    console.log(rowSelected.current)
  }

  const handleOkDeleteModal = () => {
    setIsDeleteConfirmVisible(false);
    console.log(rowSelected.current)
  }
  return (
    <ContentContainer
      title='Lịch sử bảo hành'
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: 'Lịch sử bảo hành',
          path: UrlConfig.WARRANTY,
        }]}
      extra={
        <Button type='primary' onClick={() => history.push(UrlConfig.WARRANTY + "/create")}>
          Thêm mới bảo hành
        </Button>
      }
    >
      <WarrantyHistoryListStyle>
        <Card className="card-tab">

          <Tabs>
            {TAB_STATUS.map(({ key, name }) => {
              return <TabPane tab={name} key={key}>
                <CustomTable
                  isRowSelection

                  dataSource={[{
                    id: 1,
                    product: "Polo nữ mắt chim croptop in hình - Hồng - S",
                    type: "Sửa chữa"
                  }]}
                  columns={[
                    {
                      title: 'ID',
                      dataIndex: 'id',
                      align: 'center',
                      render: (id, record) => {
                        return <div>
                          <Link to={"#"}>{id}</Link>
                          <br />
                          <span>04/10</span>
                        </div>
                      },
                    },
                    {
                      title: 'Khách hàng',
                      align: 'center',
                      render: (id, record) => {
                        return <div>
                          <b>Nguyễn Văn A</b>
                          <br />
                          <span>09878489938</span>
                        </div>
                      }
                    },
                    {
                      title: 'Sản phẩm',
                      dataIndex: 'product',
                    },
                    {
                      title: 'Loại',
                      dataIndex: 'type',
                    },
                    {
                      title: "Phí",
                      render: (id, record, index) => {
                        return <Button
                          icon={<AiOutlinePlus color={color.primary} />}
                          className="fee-icon"
                          onClick={() => {
                            rowClicked(record, index);
                            setIsFeeModalVisible(true);
                          }}
                        />

                      }
                    },
                    {
                      title: "Lý do",
                      render: (id, record, index) => {
                        return "Sửa cúc áo";
                      }
                    },
                    {
                      title: "Hẹn trả",
                      render: (id, record, index) => {
                        return "04/10/2020";
                      }
                    },
                    {
                      title: "Trạng thái",
                      render: (id, record, index) => {
                        return <div className='warranty-status' onClick={() => setIsStatusModalVisible(true)}>
                          <TagStatus type='danger'>
                            Không thể sửa
                          </TagStatus>

                          <TagStatus type="success" className="tag-line-height">
                            Đã trả khách
                          </TagStatus>
                        </div>
                      }
                    },
                    {
                      title: "Ghi chú",
                      render: (id, record, index) => {
                        return <Button
                          icon={<AiOutlinePlus color={color.primary} />}
                          className="fee-icon"
                          onClick={() => {
                            rowClicked(record, index);
                            setIsNoteModalVisible(true);
                          }}
                        />
                      }
                    },
                    {
                      title: "",
                      render: (text, record) => {
                        return <Dropdown.Button
                          overlay={
                            <Menu>
                              <Menu.Item icon={<CycleIcon width={20} height={30} />} key={"delete"}>
                                Chuyển người tiếp nhận
                              </Menu.Item>
                              <Menu.Item icon={<CycleIcon width={20} height={30} />} key={"delete"}>
                                Chuyển trung tâm bảo hành
                              </Menu.Item>
                              <Menu.Item icon={<EditIcon width={20} height={30} />} key={"delete"}>
                                Sửa
                              </Menu.Item>
                              <Menu.Item icon={<DeleteIcon height={30} />} key={"delete"}>
                                Xoá
                              </Menu.Item>

                            </Menu>
                          }
                          icon={<img src={MoreAction} alt="" style={{ verticalAlign: 'super' }} />}
                        />
                      }
                    }

                  ]}
                />
              </TabPane>
            })}
          </Tabs>

        </Card>
      </WarrantyHistoryListStyle>
      <FeeModal visible={isFeeModalVisible} onCancel={() => setIsFeeModalVisible(false)} onOk={handleOkFeeModal} />
      <NoteModal visible={isNoteModalVisible} onCancel={() => setIsNoteModalVisible(false)} onOk={handleOkNoteModal} />
      <WarrantyStatusModal visible={isStatusModalVisible} onCancel={() => setIsStatusModalVisible(false)} onOk={handleOkStatusModal} />
      <ModalDeleteConfirm visible={isDeleteConfirmVisible} onCancel={() => setIsDeleteConfirmVisible(false)} onOk={handleOkDeleteModal} />
    </ ContentContainer>
  )
}

export default WarrantyHistotyList