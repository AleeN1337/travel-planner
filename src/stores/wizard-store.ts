import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_WIZARD_VALUES,
  type TripWizardInput,
} from "@/types/trip";

type WizardState = {
  step: number;
  data: TripWizardInput;
  setStep: (step: number) => void;
  updateData: (partial: Partial<TripWizardInput>) => void;
  reset: () => void;
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      step: 0,
      data: DEFAULT_WIZARD_VALUES,
      setStep: (step) => set({ step }),
      updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),
      reset: () => set({ step: 0, data: DEFAULT_WIZARD_VALUES }),
    }),
    {
      name: "travel-planner-wizard",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as WizardState;
        return {
          ...state,
          data: { ...DEFAULT_WIZARD_VALUES, ...state.data },
        };
      },
    },
  ),
);
