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
