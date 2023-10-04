'use client'
import React, { useEffect, useRef } from 'react'
import { Map } from 'react-kakao-maps-sdk'

const appKey = '048f7639841a662d9971f9d7358ba98a'
const KakaoMap = ({ width = '500px', height = '400px' }) => {
  const mapRef = useRef(null)

  useEffect(() => {
    // Dynamically import the Kakao Maps library
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services`
    document.body.appendChild(script)

    script.onload = () => {
      initializeKakaoMap()
    }
  }, [])

  const initializeKakaoMap = () => {
    if (window.kakao && window.kakao.maps) {
      const { kakao } = window
      console.log(window.kakao.maps)
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      }
      if (!container) return
      const map = new window.kakao.maps.Map(container, options)
      console.log('map', map)
    }
  }

  return (
    <>
      <div ref={mapRef} style={{ width, height }}></div>

      <Map // 지도를 표시할 Container
        id="map"
        center={{
          // 지도의 중심좌표
          lat: 33.450701,
          lng: 126.570667,
        }}
        style={{
          // 지도의 크기
          width: '100%',
          height: '350px',
        }}
        level={3} // 지도의 확대 레벨
      />
    </>
  )
}

export default KakaoMap

// import React, { useEffect, useRef } from 'react'

// interface Props {
//   width?: string
//   height?: string
// }

// const { kakao } = window
// const KakaoMap = ({ width = '500px', height = '400px' }: Props) => {
//   const mapRef = useRef<HTMLDivElement | null>(null)

//   // useEffect(() => {
//   //   const { kakao } = window
//   //   console.log(kakao)
//   //   const container = document.getElementById('map')
//   //   const options = {
//   //     center: new kakao.maps.LatLng(33.45, 126.57),
//   //     level: 3,
//   //   }
//   //   if (!container) return
//   //   const map = new kakao.maps.Map(container, options)
//   //   // Dynamically import the Kakao Maps library
//   // }, [kakao])
//   useEffect(() => {
//     setTimeout(() => {
//       const { kakao } = window

//       console.log('maps', kakao.maps)
//       console.log(Object.keys(kakao.maps)) // kakao.maps의 속성들을 나열합니다.

//       const container = document.getElementById('map')
//       const options = {
//         center: new kakao.maps.LatLng(22, 11),
//         level: 3,
//       }
//       if (!container) return
//       const map = new kakao.maps.Map(container, options)
//       // Dynamically import the Kakao Maps library
//     }, 3000) // 1초 뒤에 실행
//   }, [])

//   return <div id={'map'} ref={mapRef} style={{ width, height }}></div>
// }

// export default KakaoMap
