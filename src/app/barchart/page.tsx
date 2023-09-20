import D3Bar from "@/components/D3Bar";

export default function D3Line() {
  return (
    <div>
      <D3Bar data={data} height={500} width={500} />
    </div>
  );
}

const data = [2050, 2000, 2030, 2040, 2050];
const dummyData = [
  {
    name: "population",
    points: [
      { year: 1980, tag: "인구 이동" },
      { year: 2003, tag: "인구 조사" },
      { year: 2030, tag: "출생률 감소" },
      { year: 2040, tag: "고령화 사회" },
    ],
  },
  {
    name: "housing",
    points: [
      { year: 1923, tag: "주택 건설" },
      { year: 1995, tag: "주택 정책" },
      { year: 1975, tag: "아파트 건설" },
      { year: 2000, tag: "도시 재개발" },
    ],
  },
  {
    name: "education",
    points: [
      { year: 1950, tag: "교육 개혁" },
      { year: 1985, tag: "대학 확장" },
      { year: 2005, tag: "디지털 교육" },
      { year: 2015, tag: "온라인 강의" },
    ],
  },
  {
    name: "industryJobs",
    points: [
      { year: 1965, tag: "산업화 시작" },
      { year: 1987, tag: "경제 발전" },
      { year: 2008, tag: "금융 위기" },
    ],
  },
  {
    name: "environment",
    points: [
      { year: 1970, tag: "환경 보호" },
      { year: 1992, tag: "기후 변화" },
      { year: 2010, tag: "재생 에너지" },
    ],
  },
  {
    name: "transportation",
    points: [
      { year: 1930, tag: "교육 체계 개선" },
      { year: 1960, tag: "국민 교육" },
      { year: 1998, tag: "교육 평등" },
    ],
  },
  {
    name: "healthWelfare",
    points: [
      { year: 1945, tag: "보건 체계 구축" },
      { year: 1980, tag: "복지 정책" },
      { year: 2005, tag: "보건복지 서비스" },
    ],
  },
  {
    name: "culture",
    points: [
      { year: 1920, tag: "문화 유산 보호" },
      { year: 1955, tag: "예술 발전" },
      { year: 2000, tag: "디지털 문화" },
    ],
  },
  {
    name: "safety",
    points: [
      { year: 1940, tag: "안전 규정" },
      { year: 1970, tag: "재난 대응" },
      { year: 2010, tag: "안전 교육" },
    ],
  },
];
