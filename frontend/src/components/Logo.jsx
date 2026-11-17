import bee from '../assets/bee.png'

// لوگوی زنبور (پیکسلی). برای تیز ماندن در اندازه‌های بزرگ pixelated است.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <img
      src={bee}
      alt=""
      className={`${className} object-contain`}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
