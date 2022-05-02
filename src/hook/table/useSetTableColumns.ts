import { FilterConfig } from "model/other";
import { useEffect } from "react";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";

function useSetTableColumns(
  columnType: string,
  tableColumnConfigs: FilterConfig[],
  initColumns: ICustomTableColumType<any>[],
  setColumns: (columns: ICustomTableColumType<any>[]) => void
) {

  useEffect(() => {
    const userConfigTableColumn = tableColumnConfigs.find((e) => e.type === columnType);
    if (userConfigTableColumn && initColumns.length > 0) {
      const config = JSON.parse(userConfigTableColumn?.json_content) as Array<
        ICustomTableColumType<any>
      >;
      const columnResult = initColumns.map((single, index) => {
        return {
          ...single,
          visible: config[index].visible,
        };
      })
      setColumns(columnResult);
    }
  // bỏ initColumns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnType, setColumns, tableColumnConfigs]);
}

export default useSetTableColumns;
