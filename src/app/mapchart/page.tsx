import D3Map from "@/components/D3Map";
import { getMap } from "@/service/server";

export default async function page() {
  const mapData = await getMap("world.geo.json");
  return (
    <div className="p-4">
      <D3Map mapData={mapData} />
    </div>
  );
}
