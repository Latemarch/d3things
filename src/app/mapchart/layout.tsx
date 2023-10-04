import Script from 'next/script'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <section>{children}</section>
      {/* <Script
        type="text/javascript"
        src="//dapi.kakao.com/v2/maps/sdk.js?appkey=048f7639841a662d9971f9d7358ba98a"
      ></Script> */}
    </>
  )
}
