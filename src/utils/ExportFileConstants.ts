export const ExportFileStatus = {
    Export: 1,
    Exporting: 2,
    ExportSuccess: 3,
    ExportError: 4
}
export const ExportFileName = {
    EXPORT_ORDER: "EXPORT_ORDER",
    EXPORT_PRODUCT: "EXPORT_PRODUCT",
    getName: (type: string) => {
        switch (type) {
            case ExportFileName.EXPORT_ORDER:
                return "Đơn hàng";
            case ExportFileName.EXPORT_PRODUCT:
                return "Đơn hàng";
            default:
                return "";
        }
    }
}
export const ExportFileType = {
    ALL: "all",
    INPAGE: "inpage",
    SELECTED: "selected",
    CURRENT_SEARCH: "current_search"
}