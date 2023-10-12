import D3ssr from '@/components/D3ssr'
import React from 'react'

export default function page() {
  const svgString = D3ssr()
  return <div dangerouslySetInnerHTML={{ __html: svgString }}></div>
}
