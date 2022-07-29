import styled, { CSSProperties } from "styled-components";

interface IProps {
  style?: CSSProperties;
  onClick?: () => void;
}

const ButtonAdd = (props: IProps) => {
  const { style, onClick } = props;
  return (
    <StyledSvg
      onClick={onClick}
      style={style}
      width="40"
      height="32"
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 2C0 0.895431 0.895431 0 2 0H38C39.1046 0 40 0.895431 40 2V30C40 31.1046 39.1046 32 38 32H2C0.895431 32 0 31.1046 0 30V2Z"
        fill="white"
      />
      <path
        d="M20.5356 9.57227H19.4641C19.3689 9.57227 19.3213 9.61988 19.3213 9.71512V15.3223H14.0003C13.905 15.3223 13.8574 15.3699 13.8574 15.4651V16.5366C13.8574 16.6318 13.905 16.6794 14.0003 16.6794H19.3213V22.2866C19.3213 22.3818 19.3689 22.4294 19.4641 22.4294H20.5356C20.6308 22.4294 20.6784 22.3818 20.6784 22.2866V16.6794H26.0003C26.0955 16.6794 26.1431 16.6318 26.1431 16.5366V15.4651C26.1431 15.3699 26.0955 15.3223 26.0003 15.3223H20.6784V9.71512C20.6784 9.61988 20.6308 9.57227 20.5356 9.57227Z"
        fill="#2A2A86"
      />
      <path
        d="M2 1H38V-1H2V1ZM39 2V30H41V2H39ZM38 31H2V33H38V31ZM1 30V2H-1V30H1ZM2 31C1.44772 31 1 30.5523 1 30H-1C-1 31.6569 0.343147 33 2 33V31ZM39 30C39 30.5523 38.5523 31 38 31V33C39.6569 33 41 31.6569 41 30H39ZM38 1C38.5523 1 39 1.44772 39 2H41C41 0.343145 39.6569 -1 38 -1V1ZM2 -1C0.343146 -1 -1 0.343146 -1 2H1C1 1.44772 1.44772 1 2 1V-1Z"
        fill="#2A2A86"
      />
    </StyledSvg>
  );
};

const StyledSvg = styled.svg`
  cursor: pointer;
`;

export default ButtonAdd;
