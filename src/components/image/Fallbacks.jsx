import { SvgColor } from './svgColor/SvgColor.jsx';

export function Fallback() {
  return (
    <div
      style={{
        backgroundColor: '#e0e0e0',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9e9e9e',
        borderRadius: 'inherit',
      }}
    >
      <SvgColor
        src={`/assets/icons/empty/ic-image.svg`}
        sx={{ width: 48, height: 48 }}
      />
    </div>
  );
}
