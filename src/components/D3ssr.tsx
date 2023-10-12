import * as d3 from 'd3'

export default function D3ssr() {
  const jsdom = require('jsdom')
  const { JSDOM } = jsdom
  const { document } = new JSDOM().window
  const svg = d3
    .select(document.body)
    .append('svg')
    .attr('class', 'jsjs')
    .attr('width', 1000)
    .attr('height', 500)
    .style('border', '2px solid steelblue')
    .append('g')
  const rect = svg.append('rect').attr('width', 100).attr('height', 100)
  console.log('Im server svg')

  return document.body.innerHTML
}
