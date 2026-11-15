// Apex Bank logo: Nested Chevron emblem + outlined italic wordmark (approved artwork, no font dependency).
// <ApexLogo variant="horizontal|stacked|symbol|wordmark" tone="color|white|mono-blue|mono-graphite|mono-white" height={32} title="Apex Bank" />
const TONES = { color: ["#006FCF", "#003B70", "#E71319", "#003B70"], white: ["#FFFFFF", "#FFFFFF", "#E71319", "#FFFFFF"], "mono-blue": Array(4).fill("#004B80"), "mono-graphite": Array(4).fill("#202B38"), "mono-white": Array(4).fill("#FFFFFF") };
const PATHS = ["M32 3L61 32L61 45L32 16L3 45L3 32Z", "M32 21L54 43L54 54L32 32L10 54L10 43Z", "M32 37L45 50L45 59L32 46L19 59L19 50Z"];
const Emblem = ({ t, ...p }) => (<svg viewBox="2 2 60 58" {...p}>{PATHS.map((d, i) => <path key={i} fill={t[i]} d={d} />)}</svg>);
const Word = ({ c, ...p }) => (<svg viewBox="-2 -2 367 44" width="367" height="44" {...p}><g fill={c}><g transform="translate(10 0) skewX(-14)"><path transform="translate(0 0)" fillRule="evenodd" d="M0 40 15.5 0H24.5L40 40H30.5L27.5 32H12.5L9.5 40ZM20 11 15.5 23H24.5Z"/><path transform="translate(44 0)" fillRule="evenodd" d="M0 0H24C33 0 38 5 38 12.5S33 25 24 25H9.5V40H0ZM9.5 8.5H23C26 8.5 28 10 28 12.5S26 16.5 23 16.5H9.5Z"/><path transform="translate(87 0)" fillRule="evenodd" d="M0 0H36V8.5H9.5V15.5H32V24H9.5V31.5H36V40H0Z"/><path transform="translate(127 0)" fillRule="evenodd" d="M0 0H11L20 15 29 0H40L26 20 40 40H29L20 25 11 40H0L14 20Z"/><path transform="translate(182 0)" fillRule="evenodd" d="M0 0H23C31 0 36 4 36 10.5C36 15 33.5 18 30 19C34.5 20 38 23.5 38 29C38 36 33 40 24 40H0ZM9.5 8H21.5C24.5 8 26.5 9 26.5 11.2S24.5 14.5 21.5 14.5H9.5ZM9.5 22.5H22.5C26 22.5 28 24 28 26.2S26 32 22.5 32H9.5Z"/><path transform="translate(225 0)" fillRule="evenodd" d="M0 40 15.5 0H24.5L40 40H30.5L27.5 32H12.5L9.5 40ZM20 11 15.5 23H24.5Z"/><path transform="translate(270 0)" fillRule="evenodd" d="M0 0H10L28.5 24V0H38V40H28L9.5 16V40H0Z"/><path transform="translate(314 0)" fillRule="evenodd" d="M0 0H9.5V16L26 0H38L20 18.5 39 40H27L9.5 21.5V40H0Z"/></g></g></svg>);
const SIZE = { horizontal: [438.2, 51.8], stacked: [367, 190], symbol: [60, 58], wordmark: [367, 44] };
export default function ApexLogo({ variant = "horizontal", tone = "color", height = 32, title = "Apex Bank", className }) {
  const t = TONES[tone] || TONES.color, [W, H] = SIZE[variant] || SIZE.horizontal;
  const inner = {
    horizontal: <><Emblem t={t} x="0" y="0" width="53.6" height="51.8" /><Word c={t[3]} x="71.2" y="3.9" /></>,
    stacked: <><Emblem t={t} x="121.6" y="0" width="123.75" height="119.6" /><Word c={t[3]} x="0" y="146" /></>,
  }[variant];
  const wrap = { horizontal: "0 0 438.2 51.8", stacked: "0 0 367 190" }[variant];
  if (variant === "symbol") return <Emblem t={t} role="img" aria-label={title} className={className} height={height} width={(height * W) / H} />;
  if (variant === "wordmark") return <Word c={t[3]} role="img" aria-label={title} className={className} height={height} width={(height * W) / H} />;
  return (<svg role="img" aria-label={title} className={className} viewBox={wrap} height={height} width={(height * W) / H}>{inner}</svg>);
}
