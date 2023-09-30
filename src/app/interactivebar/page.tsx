import D3StackedBar from '@/components/D3StackedBar'

export default function page() {
  return (
    <div>
      <D3StackedBar data={data} />
    </div>
  )
}
const data: FruitSalesData[] = [
  { date: new Date('2015-01-01'), fruit: 'apples', sales: 3840 },
  { date: new Date('2015-01-01'), fruit: 'bananas', sales: 1920 },
  { date: new Date('2015-01-01'), fruit: 'cherries', sales: 960 },
  { date: new Date('2015-01-01'), fruit: 'durians', sales: 400 },
  { date: new Date('2015-02-01'), fruit: 'apples', sales: 1600 },
  { date: new Date('2015-02-01'), fruit: 'bananas', sales: 1440 },
  { date: new Date('2015-02-01'), fruit: 'cherries', sales: 960 },
  { date: new Date('2015-02-01'), fruit: 'durians', sales: 400 },
  { date: new Date('2015-03-01'), fruit: 'apples', sales: 640 },
  { date: new Date('2015-03-01'), fruit: 'bananas', sales: 960 },
  { date: new Date('2015-03-01'), fruit: 'cherries', sales: 640 },
  { date: new Date('2015-03-01'), fruit: 'durians', sales: 400 },
  { date: new Date('2015-04-01'), fruit: 'apples', sales: 320 },
  { date: new Date('2015-04-01'), fruit: 'bananas', sales: 480 },
  { date: new Date('2015-04-01'), fruit: 'cherries', sales: 640 },
  { date: new Date('2015-04-01'), fruit: 'durians', sales: 400 },
]

export type FruitSalesData = {
  date: Date
  fruit: string
  sales: number
}
