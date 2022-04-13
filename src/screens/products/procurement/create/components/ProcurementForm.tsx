import { CheckCircleOutlined, LoadingOutlined, PhoneOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Modal, Row, Select, Upload } from "antd";
import Text from "antd/lib/typography/Text";
import { UploadFile } from "antd/lib/upload/interface";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { EnumImportStatus, EnumJobStatus } from "config/enum.config";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { uploadFileAction } from "domain/actions/core/import.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { importProcumentAction } from "domain/actions/po/po-procument.action";
import { debounce } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ProcurementCreate } from "model/procurement";
import { ProcurementField } from "model/procurement/field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ImportProcument } from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { VscError } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SupplierItem from "screens/purchase-order/component/supplier-item";
import { listPurchaseOrderApi } from "service/purchase-order/purchase-order.service";
import { getJobImport } from "service/purchase-order/purchase-procument.service";
import { callApiNative } from "utils/ApiUtils";

interface ProcurementFormProps {
	formMain: FormInstance;
	setDataResult: (data: ProcurementCreate) => void;
	setListPO: (listPO: Array<PurchaseOrder>) => void;
}

export const CON_STATUS_IMPORT = {
	DEFAULT: 1,
	CHANGE_FILE: 2,
	CREATE_JOB_SUCCESS: 3,
	JOB_FINISH: 4,
	ERROR: 5,
};

type UploadStatus = "ERROR" | "SUCCESS" | "DONE" | "PROCESSING" | "REMOVED" | undefined;

const ProcurementForm: React.FC<ProcurementFormProps> = (props: ProcurementFormProps) => {
	const { formMain, setDataResult, setListPO } = props
	const [data, setData] = useState<Array<SupplierResponse>>([]);
	const [isSelectSupplier, setIsSelectSupplier] = useState<boolean>(false);
	const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
	const [fileList, setFileList] = useState<Array<UploadFile>>([]);
	const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
	const [statusImport, setStatusImport] = useState<number>(CON_STATUS_IMPORT.DEFAULT);
	const [jobImportStatus, setJobImportStatus] = useState<EnumJobStatus>();
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
	const [lstJob, setLstJob] = useState<Array<string>>([]);
	const [storeID, setStoreID] = useState<number | undefined>(undefined)
	const [supplierID, setSupplierID] = useState<string | undefined>(undefined)
	const [linkFileImport, setLinkFileImport] = useState<string>();
	const [showModal, setShowModal] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(StoreGetListAction(setListStore));
	}, [dispatch])

	const renderResult = useMemo(() => {
		let options: any[] = [];
		data.forEach((item: SupplierResponse, index: number) => {
			options.push({
				label: <SupplierItem data={item} key={item.id.toString()} />,
				value: item.id.toString(),
			});
		});

		return options;
	}, [data]);

	const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
		setLoadingSearch(false);
		setData(result.items);
	}, []);

	const debouncedSearchSupplier = useMemo(
		() =>
			debounce((keyword: string) => {
				setLoadingSearch(true);
				dispatch(SupplierSearchAction({ condition: keyword.trim(), status: "active" }, onResult));
			}, 300),
		[dispatch, onResult]
	);

	const onChangeKeySearchSupplier = (keyword: string) => {
		debouncedSearchSupplier(keyword);
	};

	const removeSupplier = () => {
		formMain.setFieldsValue({
			[ProcurementField.supplier_id]: undefined,
			[ProcurementField.supplier]: null,
			[ProcurementField.supplier_phone]: null,
		});
		setSupplierID(undefined)
		setIsSelectSupplier(false);
	};

	const onSelect = (value: string) => {
		let index = data.findIndex((item) => item.id === +value);
		let supplier = data[index];

		formMain.setFieldsValue({
			[ProcurementField.supplier_id]: value,
			[ProcurementField.supplier]: data[index].name,
			[ProcurementField.supplier_phone]: supplier.phone,
		});
		setSupplierID(value)
		setIsSelectSupplier(true);
	};

	const onChangeStore = useCallback((value: any) => {
		formMain.setFieldsValue({ [ProcurementField.store_id]: value })
		setStoreID(value)
	}, [formMain])

	const onChangeFile = useCallback((info: any) => {
		if (info.file.status !== 'removed') {
			setFileList([info.file]);
		}
	},[]);

	const getPOItems = useCallback(async (purchaseOrderIDS: string) => {
		const ids = purchaseOrderIDS.split(',').join('&ids=')
		const listPoRes = await callApiNative({ isShowError: true }, dispatch, listPurchaseOrderApi, { ids })
		if (listPoRes) {
			setListPO(listPoRes)
		} else {
			setUploadStatus(EnumJobStatus.error);
			setErrorMessage('Không tìm thấy đơn nào')
		}
	}, [dispatch, setListPO])

	const checkImportFile = useCallback(() => {
		let getFilePromises = lstJob.map((code) => {
			return getJobImport(code);
		});

		Promise.all(getFilePromises).then((responses) => {
			responses.forEach((response) => {
				if (response.code === HttpStatus.SUCCESS) {

					if (response.data && response.data.status === EnumJobStatus.finish) {
						if (response.data.message[0].po_ids) {
							getPOItems(response.data.message[0].po_ids)
							setDataResult(response.data)
							setUploadStatus(EnumJobStatus.success);
						}else {
							setUploadStatus(EnumJobStatus.error);
							setErrorMessage('Không tìm thấy đơn nào')
						}
						setJobImportStatus(EnumJobStatus.finish);
						setStatusImport(CON_STATUS_IMPORT.JOB_FINISH);
						const fileCode = response.data.code;
						const newListExportFile = lstJob.filter((item) => {
							return item !== fileCode;
						});

						setLstJob(newListExportFile);
						return
					} else if (response.data && response.data.status === EnumJobStatus.error) {
						setJobImportStatus(EnumJobStatus.error);
						setUploadStatus(EnumJobStatus.error);
						setStatusImport(CON_STATUS_IMPORT.JOB_FINISH);
						const fileCode = response.data.code;
						const newListExportFile = lstJob.filter((item) => {
							return item !== fileCode;
						});
						setLstJob(newListExportFile);
						return
					}
					setJobImportStatus(EnumJobStatus.processing);
				}
			});
		});
	}, [getPOItems, lstJob, setDataResult]);

	useEffect(() => {
		if (lstJob.length === 0 || jobImportStatus !== EnumJobStatus.processing) return;
		checkImportFile();
		const getFileInterval = setInterval(checkImportFile, 3000);
		return () => clearInterval(getFileInterval);
	}, [lstJob, checkImportFile, jobImportStatus]);

	const onResultImport = useCallback((res) => {
		if (res) {
			const { status, code } = res;
			if (status === EnumImportStatus.processing) {
				setUploadStatus(status);
				setLstJob([code]);
				checkImportFile();
			}
		}
	}, [checkImportFile]);

	const onResultChange = useCallback((res)=>{
		if (res) {
			fileList[0] = {...fileList[0],status: "done", url:res[0]};
			setFileList([...fileList]);
			setLinkFileImport(res[0]);
			setStatusImport(CON_STATUS_IMPORT.CREATE_JOB_SUCCESS);
			setShowModal(true)
		} 

	},[fileList]);

	//Đọc file excel chi tiết sản phẩm để map với DDH đã đặt
	const onImportFile = useCallback(() => {
		if (linkFileImport && linkFileImport.length > 0) {
			setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
			const supplier_id = formMain.getFieldValue([ProcurementField.supplier_id])
			const store_id = formMain.getFieldValue([ProcurementField.store_id])
			const params: ImportProcument = {
				url: linkFileImport,
				conditions: `${supplier_id},${store_id}`,
				type: "IMPORT_PROCUREMENT_CREATE"
			}
			setJobImportStatus(EnumJobStatus.processing);
			dispatch(importProcumentAction(params, onResultImport))
		}
	}, [dispatch, formMain, onResultImport, linkFileImport])


	return (
		<Row gutter={50}>
			<Col span={8}>
				<Form.Item
					shouldUpdate={(prevValues, curValues) =>
						prevValues[ProcurementField.supplier_id] !== curValues[ProcurementField.supplier_id]
					}
					className="margin-bottom-0">
					{({ getFieldValue }) => {
						let supplier_id = getFieldValue([ProcurementField.supplier_id]);
						let supplier = getFieldValue([ProcurementField.supplier]);
						let phone = getFieldValue([ProcurementField.supplier_phone])
						return (
							<>
								{((isSelectSupplier) || supplier_id) ? (
									<div style={{ marginBottom: 15 }}>
										<div style={{ display: 'flex', alignItems: "center" }}>
											<Link
												to={`${UrlConfig.SUPPLIERS}/${supplier_id}`}
												className="primary"
												target="_blank"
												style={{ fontSize: "16px", marginRight: 10 }}>
												{supplier}
											</Link>
											{isSelectSupplier && (
												<Button type="link" onClick={removeSupplier} style={{ display: "flex", alignItems: "center" }} icon={<AiOutlineClose />} />
											)}
										</div>
										<>
											<Form.Item hidden name={[ProcurementField.supplier_id]}>
												<Input />
											</Form.Item>
											<Form.Item hidden name={[ProcurementField.supplier]}>
												<Input />
											</Form.Item>
											<Form.Item hidden name={[ProcurementField.supplier_phone]}>
												<Input />
											</Form.Item>
											<Row>
												<div><PhoneOutlined />{" "} <Text strong>{phone}</Text></div>
											</Row>
										</>
									</div>
								) : <><Text strong>Chọn nhà cung cấp</Text><span style={{ color: 'red' }}>*</span>
									<Form.Item
										name={[ProcurementField.supplier_id]}
										rules={[
											{
												required: true,
												message: "Vui lòng chọn nhà cung cấp",
											},
										]}>
										<CustomAutoComplete
											loading={loadingSearch}
											dropdownClassName="supplier"
											placeholder="Tìm kiếm nhà cung cấp"
											onSearch={onChangeKeySearchSupplier}
											dropdownMatchSelectWidth={456}
											style={{ width: "100%" }}
											onSelect={(value) => {
												if (!value) return
												onSelect(value)
											}}
											options={renderResult}
										/>
									</Form.Item>
								</>}
							</>
						);
					}}
				</Form.Item>
				<Form.Item
					name={[ProcurementField.file]}
					rules={[
						{
							required: true,
							message: "Vui lòng nhập file",
						},
					]}
				>
					<Upload
						accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						maxCount={1}
						fileList={fileList}
						onChange={onChangeFile}
						onRemove={(file) => {
							const index = fileList.indexOf(file);
							const newFileList = [...fileList]
							newFileList.splice(index, 1);
							return setFileList(newFileList)
						}}
						customRequest={(option: any) => {
							return dispatch(uploadFileAction([option.file],"stock-transfer", onResultChange));
						}}
					>
						<Button
							disabled={storeID === undefined || supplierID === undefined ? true : false}
							size="middle"
							icon={<UploadOutlined />}
						>
							Nhập file sản phẩm
						</Button>
					</Upload>
				</Form.Item>
			</Col>
			<Col span={8}>
				<Text strong>Chọn kho nhận </Text><span style={{ color: 'red' }}>*</span>
				<Form.Item
					name={[ProcurementField.store_id]}
					rules={[
						{
							required: true,
							message: "Vui lòng chọn kho nhận hàng",
						},
					]}
				>
					<Select
						allowClear
						showSearch
						showArrow
						optionFilterProp="children"
						placeholder="Chọn kho nhận"
						onChange={onChangeStore}
					>
						{listStore.map((item) => (
							<Select.Option key={item.id} value={item.id}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
			</Col>
			<Col span={8}>
				<Text strong>Ghi chú </Text>
				<Form.Item name={[ProcurementField.note]}>
					<Input.TextArea rows={4} maxLength={500} placeholder="Nhập ghi chú" />
				</Form.Item>
			</Col>

			<Modal
				visible={showModal}
				title="Tạo phiếu"
				onCancel={() => {
					setUploadStatus(undefined);
					setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
					setShowModal(false)
					setErrorMessage('')
				}}
				footer={[<>
					{statusImport === CON_STATUS_IMPORT.CREATE_JOB_SUCCESS && (
						<>
							<Button
								key="ok"
								type="primary"
								onClick={onImportFile}
							>
								Xác nhận
							</Button>
							<Button
								key="cancel"
								type="primary"
								onClick={() => {
									setUploadStatus(undefined);
									setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
									setShowModal(false)
									setErrorMessage('')
								}}
							>
								Hủy
							</Button>
						</>
					)}
					{(statusImport === CON_STATUS_IMPORT.JOB_FINISH || statusImport === CON_STATUS_IMPORT.ERROR) && (
						<Button key="link" type="primary" onClick={() => {
							setUploadStatus(undefined);
							setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
							setShowModal(false)
							setErrorMessage('')
						}}>
							Ok
						</Button>
					)}
				</>,]}
			>
				<div
				>
					<Row justify={"center"}>
						{!uploadStatus ?
							<div>
								<p>Bạn chắc chắn muốn tạo phiếu?</p>
							</div> : ""}
						{uploadStatus === EnumImportStatus.processing ? (
							<Col span={24}>
								<Row justify={"center"}>
									<LoadingOutlined style={{ fontSize: "78px", color: "#E24343" }} />
								</Row>
								<Row justify={"center"}>
									<h2 style={{ padding: "10px 30px" }}>Đang xử lý nhập file...</h2>
								</Row>
							</Col>
						) : (
							""
						)}
						{uploadStatus === EnumImportStatus.error ? (
							<Col span={24}>
								<Row justify={"center"}>
									<VscError style={{ fontSize: "78px", color: "#E24343" }} />
								</Row>
								<Row justify={"center"}>
									<h2 style={{ padding: "10px 30px" }}>
										<li>{errorMessage ?? "Máy chủ đang bận"}</li>
									</h2>
								</Row>
							</Col>
						) : (
							""
						)}
						{uploadStatus === EnumImportStatus.done ||
							uploadStatus === EnumImportStatus.success ||
							uploadStatus === EnumImportStatus.error ? (
							<Col span={24}>
								{
									uploadStatus === EnumImportStatus.success &&
									<>
										<Row justify={"center"}>
											<CheckCircleOutlined style={{ fontSize: "78px", color: "#27AE60" }} />
										</Row>
										<Row justify={"center"}>
											<h2 style={{ padding: "10px 30px" }}>
												Xử lý nhập hoàn tất:{" "}
												<strong style={{ color: "#2A2A86" }}>
												</strong>{" "}
											</h2>
										</Row>
									</>
								}
							</Col>
						) : (
							""
						)}
					</Row>
				</div>
			</Modal>
		</Row>

	)
}


export default ProcurementForm

