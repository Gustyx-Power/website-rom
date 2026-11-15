// Ticker berjalan gaya brutalism — items dirender dua kali untuk loop mulus.
export default function Marquee({ items = [] }) {
  const row = (hidden) => (
    <div className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((text, i) => (
        <span className="marquee__item" key={i}>
          {text}
          <span className="marquee__dot">■</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
