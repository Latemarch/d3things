import { atom } from "recoil";

export const yearState = atom<number>({
  key: "yearState",
  default: 2023,
});

type LocalProps = {
  category: "total" | "sido" | "sgg" | "umd";
  localName: string;
};
export const targetLocation = atom<LocalProps>({
  key: "targetLocation",
  default: { category: "total", localName: "none" },
});

export const LivingSliderPoint = atom<number>({
  key: "LivingSliderPoint",
  default: 10,
});

export const LivingPredictionSliderPoint = atom<number>({
  key: "LivingPredictionSliderPoint",
  default: 12,
});
export type LPSelector = {
  [key: string]: string;
};
export const LivingPredictionSelector = atom<LPSelector>({
  key: "LivingPredictionSelector",
  default: { model: "통계모델", gender: "전체", ages: "전체" },
});
