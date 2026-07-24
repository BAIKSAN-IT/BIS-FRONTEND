import { memo } from "react";

interface Props {
  src?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  alt?: string;
}

const ImgComponent = memo(({ src, onClick, style, className, id, alt }: Props) => {
  return <img className={className} style={style} src={src} alt={alt} onClick={onClick} id={id} />;
});

export default ImgComponent;
