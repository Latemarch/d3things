import D3KakaoMap from "@/components/D3kakaomap";
import { getLocalMap } from "@/service/server";

export default async function page() {
  const mapData = await getLocalMap();

  return (
    <div className="">
      <D3KakaoMap data={mapData} />
    </div>
  );
}
