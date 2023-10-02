'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Props {
  data?: any
  width?: number
  height?: number
}

export default function D3CnadleStick({
  data,
  width = 500,
  height = 500,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    d3.select(ref.current).selectAll('svg').remove()

    const svg = d3
      .select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', width)
      // .attr('viewBox', `0 0 ${width + 80} ${height + 80}`)
      .style('border', '1px solid steelblue')
      .append('g')
      .attr('transform', `translate(40,40)`)
  }, [])
  return <div ref={ref} className="p-10"></div>
}
