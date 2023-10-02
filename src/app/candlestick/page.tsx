import D3StackedBar from '@/components/D3CandleStick'
import { getTicks } from '@/service/server'

export default async function page() {
  const data = await getTicks('BTCUSD230910.csv.gz')
  console.log(data[0])
  return (
    <div>
      <D3StackedBar />
    </div>
  )
}
