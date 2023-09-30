'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { FruitSalesData } from '@/app/interactivebar/page'

interface Props {
  data?: any
  width?: number
  height?: number
}

export default function D3StackedBar({
  data,
  width = 500,
  height = 500,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    console.log('hi1')
    if (!ref.current) return

    console.log('hi')
    d3.select(ref.current).selectAll('svg').remove()
    const x = d3.scaleLinear([0, 10], [0, width])
    const y = d3.scaleLinear([0, 10000], [height, 0])

    const a = d3.index(
      data,
      (d: FruitSalesData) => d.date,
      (d) => d.fruit,
    )
    const series = d3
      .stack()
      .keys(d3.union(data.map((d: FruitSalesData) => d.fruit)))
      .value(([, group], key) => group.get(key).sales)(a)

    console.log(series)

    const svg = d3
      .select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', width)
      // .attr('viewBox', `0 0 ${width + 80} ${height + 80}`)
      .style('border', '1px solid steelblue')
      .append('g')
      .attr('transform', `translate(40,40)`)
    svg
      .append('rect')
      .attr('width', 100)
      .attr('height', 100)
      .attr('fill', 'red')
  }, [])
  return (
    <div ref={ref} className="p-10">
      D3StackedBar
    </div>
  )
}
