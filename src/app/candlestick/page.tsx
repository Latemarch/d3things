import D3StackedBar from "@/components/D3CandleStick";
import { getJsonTicks, getTicks } from "@/service/server";

export default async function page() {
  // const data = await getTicks('BTCUSD230910.csv.gz')
  const data = await getJsonTicks("001.json");
  return (
    <div>
      <D3StackedBar data={data} />
    </div>
  );
}
