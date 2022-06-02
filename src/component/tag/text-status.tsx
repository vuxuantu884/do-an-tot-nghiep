



interface TextStatusProps {
  type?: string;
  children: React.ReactNode;
  isOutline?: boolean;
  icon?: string | undefined;
}

function TextStatus(props: TextStatusProps) {
  const { type, children, icon } = props;
  // let bgColor = "";
  let color = "";
  switch (type) {
    case "warning":
      // bgColor = "#FFFAF0";
      color = "#FCAF17";
      break;
    case "success":
      // bgColor = "#F0FCF5";
      color = "#27AE60";
      break;
    case "danger":
      // bgColor = "rgba(226, 67, 67, 0.1)";
      color = "#E24343";
      break;
    case "primary":
      // bgColor = "rgba(42, 42, 134, 0.1)";
      color = "#2A2A86";
      break;
    case "secondary":
      color = "#666666";
      break;
    case "normal":
    default:
      // bgColor = "rgba(245, 245, 245, 1)";
      color = "#878790";
      break;
  }
  return (
    // <TagStatusStyle>
      <div style={{color: color}}>
        { icon && <img width={20} height={20} src={icon} alt="" style={{ marginRight: 4, marginBottom: 2 }}/> }
        {children}
      </div>
    // </TagStatusStyle>
  );
}

export default TextStatus;