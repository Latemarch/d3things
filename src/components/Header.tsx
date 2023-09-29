import Link from 'next/link'
import React from 'react'

export default function Header() {
  return (
    <div className="flex h-10 gap-10">
      <Link href="/barchart">bar</Link>
      <Link href="/interactivebar">interactive bar</Link>
      <Link href="/mapchart">Map</Link>
    </div>
  )
}
