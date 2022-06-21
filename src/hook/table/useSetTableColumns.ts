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
    console.log('initColumns', initColumns)
    console.log('userConfigTableColumn', userConfigTableColumn)
    if (userConfigTableColumn) {
      const config = JSON.parse(userConfigTableColumn?.json_content) as Array<
      ICustomTableColumType<any>
      >;
      console.log('config', config);
      let columnsWithConfigArr:ICustomTableColumType<any>[] = [];
      config.forEach((single) => {
        const selected = initColumns.find(column => column.key === single.key)
        console.log('selected', selected);
        if(selected) {
          columnsWithConfigArr.push({
            ...selected,
            visible: selected ? (single?.visible) : false,
          })
        }
      })
      const leftColumnArr = initColumns.filter(column => !config.map(single => single.key).includes(column.key))
      let columnResult:ICustomTableColumType<any>[] = [...columnsWithConfigArr, ...leftColumnArr];
      setColumns(columnResult);
    }
  // bỏ initColumns, thêm orderVariable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnType, setColumns, tableColumnConfigs, orderVariable]);
}

export default useSetTableColumns;
