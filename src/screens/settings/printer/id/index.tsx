import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { actionFetchPrinterDetail } from "domain/actions/printer/printer.action";
import {
	BasePrinterModel,
	FormPrinterModel,
} from "model/response/printer.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { DEFAULT_COMPANY } from "utils/Constants";
import { useQuery } from "utils/useQuery";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
	const dispatch = useDispatch();
	const viewAction: FormPrinterModel = "view";
	const editAction: FormPrinterModel = "edit";
	const [singlePrinterContent, setSinglePrinterContent] =
		useState<BasePrinterModel>({
			company: DEFAULT_COMPANY.company,
			company_id: DEFAULT_COMPANY.company_id,
			store_id: 0,
			id: 0,
			name: "",
			print_size: "",
			is_default: false,
			template: "",
			type: "",
		});

	const paramsId = useParams<{ id: string }>();
	const { id } = paramsId;
	const [printerName, setPrinterName] = useState("");
	const [actionSinglePrinter, setActionSinglePrinter] =
		useState<FormPrinterModel>(viewAction);
	const [isPrint, setIsPrint] =
		useState(false);
	const query = useQuery();
	let queryAction = query.get("action");
	let queryPrint = query.get("print");

	const queryParams = useMemo(() => {
		let result = {
			action: "",
			print: "",
		};
		if (queryAction) {
			result = {
				...result,
				action: queryAction,
			};
		}
		if (queryPrint) {
			result = {
				...result,
				print: queryPrint,
			};
		}
		return result;
	}, [queryAction, queryPrint]);

	const breadCrumb = [
		{
			name: "Tổng quan",
			path: UrlConfig.HOME,
		},
		{
			name: "Cài đặt",
			path: UrlConfig.ACCOUNTS,
		},
		{
			name: "Danh sách mẫu in",
			path: UrlConfig.PRINTER,
		},
	];

	const breadCrumbViewDetail = [
		...breadCrumb,
		{
			name: printerName,
		},
	];

	const breadCrumbEdit = [
		...breadCrumb,
		{
			name: printerName,
			path: `${UrlConfig.PRINTER}/${id}`,
		},
		{
			name: "Tùy chỉnh mẫu in",
		},
	];

	useEffect(() => {
		dispatch(
			actionFetchPrinterDetail(+id, queryParams, (data: BasePrinterModel) => {
				setSinglePrinterContent(data);
				if (data) {
					setPrinterName(data.name);
				}
			})
		);
	}, [dispatch, id, queryParams]);

	/**
	 * kiểm tra action là view chi tiết hay sửa
	 */
	useEffect(() => {
		let actionParam = queryParams.action;
		let printParam = queryParams.print;
		if (actionParam === editAction) {
			setActionSinglePrinter(editAction);
			if (printParam === "true") {
				setIsPrint(true);
			}
		} else {
			setActionSinglePrinter(viewAction);
			setIsPrint(false)
		}
	}, [dispatch, id, queryParams]);

	return (
		<StyledComponent>
			<ContentContainer
				title={
					queryParams.action === editAction
						? "Tùy chỉnh mẫu in"
						: "Chi tiết mẫu in"
				}
				breadcrumb={
					queryParams.action === editAction
						? breadCrumbEdit
						: breadCrumbViewDetail
				}
			>
				<FormPrinter
					type={actionSinglePrinter}
					isPrint={isPrint}
					id={id}
					formValue={singlePrinterContent}
				/>
			</ContentContainer>
		</StyledComponent>
	);
}

export default SinglePrinter;
