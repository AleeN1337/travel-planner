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
      version: 4,
      migrate: (persisted) => {
        const state = persisted as WizardState & {
          data?: TripWizardInput & { travelStyle?: string };
        };
        const prev = state.data ?? DEFAULT_WIZARD_VALUES;
        const legacyStyle = (prev as { travelStyle?: string }).travelStyle;
        const travelStyles =
          prev.travelStyles?.length ?
            prev.travelStyles
          : legacyStyle ?
            [legacyStyle as TripWizardInput["travelStyles"][number]]
          : DEFAULT_WIZARD_VALUES.travelStyles;

        return {
          ...state,
          data: {
            ...DEFAULT_WIZARD_VALUES,
            ...prev,
            travelStyles,
          },
        };
      },
    },
  ),
);
