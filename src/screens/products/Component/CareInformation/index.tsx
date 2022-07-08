import { Col, Modal, Popover, Row } from "antd";
import { CareLabelItem } from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { careInformation } from "./care-value";
import { StyledComponent } from "./style";

type ModalCaresProps = {
  visible: boolean;
  careLabels: string;
  onCancel: () => void;
  onOk: (newCareLabes: string) => void;
};

const ModalCares: React.FC<ModalCaresProps> = (
  props: ModalCaresProps
) => {
  const { visible, careLabels, onCancel, onOk } = props;
  
  const [selected, setSelected] = useState<string []>(careLabels ? careLabels.split(";") : []);
  
  const [careInformationState, setCareInformationState] = useState(careInformation);

  const onSelect = useCallback((value: string, type: string) => {
    console.log('value value', value, type);
    const index = selected.findIndex(select => select === value);
    let newSelected = selected;
    let newCareInformationStateType = [];
    if (index > -1) {
      newSelected.splice(index, 1);
      newCareInformationStateType = careInformationState[type].map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: false,
          }
        }
        return item
      })
      
    } else {
      newSelected.push(value);
      newCareInformationStateType = careInformationState[type].map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: true,
          }
        }
        return item
      })
    }
    setSelected(newSelected);
    setCareInformationState({
      ...careInformationState,
      [type]: newCareInformationStateType
    })
    console.log('newSelected', newSelected);
    console.log('newCareInformationStateType', newCareInformationStateType);

  }, [careInformationState, selected]);

  // const onCancelClick = useCallback(() => {
  //   onCancel();
  // }, [onCancel]);

  const onOkClick = useCallback(() => {
    let newCareLabes = "";
    careInformationState.washing.forEach((item: any) => {
      if (item.active) {
        newCareLabes += `${item.value};`;
      }
    });
    careInformationState.beleaching.forEach((item: any) => {
      if (item.active) {
        newCareLabes += `${item.value};`;
      }
    });
    careInformationState.ironing.forEach((item: any) => {
      if (item.active) {
        newCareLabes += `${item.value};`;
      }
    });
    careInformationState.drying.forEach((item: any) => {
      if (item.active) {
        newCareLabes += `${item.value};`;
      }
    });

    careInformationState.professionalCare.forEach((item: any) => {
      if (item.active) {
        newCareLabes += `${item.value};`;
      }
    });
    onOk(newCareLabes);
  }, [onOk, careInformationState]);
  useEffect(() => {
    const newSelected = careLabels ? careLabels.split(";") : []
    let washing = careInformation.washing
    let beleaching = careInformation.beleaching
    let ironing = careInformation.ironing
    let drying = careInformation.drying
    let professionalCare = careInformation.professionalCare
    
    newSelected.forEach(value => {
      const newWashing = washing.map((item: any) => {
        if (value === item.value) {
          console.log(value);
          
          return {
            ...item,
            active: true,
          }
        }
        return item
      });
      washing = newWashing;
      
      const newBeleaching = beleaching.map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: true,
          }
        }
        return item
      });
      beleaching = newBeleaching;

      const newIroning = ironing.map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: true,
          }
        }
        return item
      });
      ironing = newIroning;

      const newDrying = drying.map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: true,
          }
        }
        return item
      });
      drying = newDrying;

      const newProfessionalCare = professionalCare.map((item: any) => {
        if (value === item.value) {
          return {
            ...item,
            active: true,
          }
        }
        return item
      });
      professionalCare = newProfessionalCare
    })
    setSelected(newSelected)
    setCareInformationState({
      washing,
      beleaching,
      ironing,
      drying,
      professionalCare
    })
  }, [careLabels]);

  return (
    <Modal
      onOk={onOkClick}
      onCancel={onCancel}
      title="Thông tin bảo quản"
      width={900}
      visible={visible}
    >
      <StyledComponent>
        <p className="label">GIẶT</p>
        <Row gutter={24}>
          {careInformationState.washing.map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: '20px'}}>
              <Popover content={item.name}>
              <span onClick={() => onSelect(item.value, 'washing')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
              </Popover>
            </Col>
          ))}
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <p className="label">CHẤT TẨY</p>
            <Row gutter={24}>
              {careInformationState.beleaching.map((item: any) => (
                <Col key={item.value} span={6} style={{ marginBottom: '20px'}}>
                  <Popover content={item.name}>
                  <span onClick={() => onSelect(item.value, 'beleaching')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
                  </Popover>
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={12}>
            <p className="label">ỦI</p>
            <Row gutter={24}>
              {careInformationState.ironing.map((item: any) => (
                <Col key={item.value} span={6} style={{ marginBottom: '20px'}}>
                  <Popover content={item.name}>
                  <span onClick={() => onSelect(item.value, 'ironing')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
                  </Popover>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <p className="label">SẤY - PHƠI</p>
        <Row gutter={24}>
          {careInformationState.drying.filter((e: CareLabelItem)=>e.type===1).map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: '20px'}}>
              <Popover content={item.name}>
                <span onClick={() => onSelect(item.value, 'drying')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
              </Popover>
            </Col>
          ))}
        </Row>
        <Row gutter={24}>
          {careInformationState.drying.filter((e: CareLabelItem)=>e.type===2).map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: '20px'}}>
              <Popover content={item.name}>
                <span onClick={() => onSelect(item.value, 'drying')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
              </Popover>
            </Col>
          ))}
        </Row>

        <p className="label">GIẶT KHÔ/ƯỚT CHUYÊN NGHIỆP</p>
        <Row gutter={24}>
          {careInformationState.professionalCare.filter((e: CareLabelItem)=>e.type===1).map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: '20px'}}>
              <Popover content={item.name}>
                <span onClick={() => onSelect(item.value, 'professionalCare')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
              </Popover>
            </Col>
          ))}
        </Row><Row gutter={24}>
          {careInformationState.professionalCare.filter((e: CareLabelItem)=>e.type===2).map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: '20px'}}>
              <Popover content={item.name}>
                <span onClick={() => onSelect(item.value, 'professionalCare')} className={`yody-icon ydl-${item.value} ${item.active ? "active" : "deactive"}`}></span>
              </Popover>
            </Col>
          ))}
        </Row>
      </StyledComponent>
    </Modal>
  );
};

export default ModalCares;
