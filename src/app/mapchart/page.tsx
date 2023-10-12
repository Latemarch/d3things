import D3Map from '@/components/D3Map'
import D3KakaoMap from '@/components/D3kakaomap'
import { getLocalMap } from '@/service/server'
import { FeatureCollection } from 'geojson'

export default async function page() {
  const mapData = (await getLocalMap()) as FeatureCollection

  return (
    <div className="">
      {/* <D3KakaoMap data={mapData} /> */}
      <D3Map mapData={mapData} />
    </div>
  )
}
