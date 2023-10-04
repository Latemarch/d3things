import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { cache } from 'react'
import { FeatureCollection } from 'geojson'

export const getMap = cache(
  async (filename: string): Promise<FeatureCollection> => {
    const filePath = path.join(process.cwd(), 'public', 'map', filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const geoJsonFile = JSON.parse(fileContents)
    return geoJsonFile
  },
)

const keys: Array<string> = [
  'timestamp',
  'symbol',
  'side',
  'size',
  'price',
  'tickDirection',
  'trdMatchID',
  'grossValue',
  'homeNotional',
  'foreignNotional',
]
export const getTicks = cache(
  async (filename: string): Promise<Array<any>> => {
    const filePath = path.join(process.cwd(), 'public', 'tickdata', filename)

    // Use zlib to unzip the file
    const compressedContents = fs.readFileSync(filePath)
    const fileContents = zlib.gunzipSync(compressedContents).toString('utf8')
    const tickData = fileContents
      .trim()
      .split('\n')
      .map((line) => {
        const values = line.split(',')
        const obj: { [key: string]: string } = {}
        keys.forEach((key, index) => {
          obj[key] = values[index]
        })
        return obj
      })

    tickData.shift()
    return tickData
  },
)

export const getJsonTicks = cache(
  async (filename: string): Promise<Array<Array<string>>> => {
    const filePath = path.join(process.cwd(), 'public', 'tickdata', filename)
    const file = fs.readFileSync(filePath, 'utf8')
    const jsonFile = JSON.parse(file)
    return jsonFile
  },
)
