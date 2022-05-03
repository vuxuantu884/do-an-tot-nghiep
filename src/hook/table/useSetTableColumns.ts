import { FilterConfig } from "model/other";
import { useEffect, useMemo } from "react";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";

function useSetTableColumns(
  columnType: string,
  tableColumnConfigs: FilterConfig[],
  initColumns: ICustomTableColumType<any>[],
  setColumns: (columns: ICustomTableColumType<any>[]) => void
) {

  
  const orderVariable = useMemo(() => {
    const orderArr = [COLUMN_CONFIG_TYPE.orderOffline, COLUMN_CONFIG_TYPE.orderOnline]
    if(orderArr.includes(columnType)) {
      return initColumns
    }
    return null
  }, [columnType, initColumns])

  useEffect(() => {
    const userConfigTableColumn = tableColumnConfigs.find((e) => e.type === columnType);
    if (userConfigTableColumn) {
      const config = JSON.parse(userConfigTableColumn?.json_content) as Array<
        ICustomTableColumType<any>
      >;
      const columnResult = config.map((single, index) => {
        const selected = initColumns.find(column => column.key === single.key) || {}
        return {
          ...single,
          title: selected?.title || undefined,
          render: selected?.render || undefined,
        };
      })
      setColumns(columnResult);
    }
  // bỏ initColumns, thêm orderVariable 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnType, setColumns, tableColumnConfigs, orderVariable]);
}

export default useSetTableColumns;
