import Link from 'next/link'
import React from 'react'

export default function Header() {
  return (
    <div className="flex h-10 gap-10">
      <Link href="/barchart">bar</Link>
      <Link href="/candlestick">CandleStick</Link>
      <Link href="/mapchart">Map</Link>
      <Link href="/test">test</Link>
    </div>
  )
}
