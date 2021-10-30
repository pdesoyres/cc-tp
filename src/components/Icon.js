export const Icon = ({
  svg,
  size = 16,
  color
}) => {
  const Svg = svg;
  return <Svg className="cc-icon" width={size} height={size} fill={color} />
};