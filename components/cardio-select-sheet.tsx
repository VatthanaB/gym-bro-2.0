"use client";

import { Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CardioType, CardioTemplate } from "@/lib/types";
import { getDefaultCardioTemplate } from "@/lib/data/workouts";

interface CardioSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentCardioType?: CardioType;
  onSelectCardio: (cardioType: CardioType) => void;
}

const cardioTypeLabels: Record<CardioType, string> = {
  elliptical: "Elliptical",
  incline_walk: "Incline Walk",
  stair_climber: "Stair Climber",
  hiit: "HIIT",
};

const allCardioTypes: CardioType[] = [
  "elliptical",
  "incline_walk",
  "stair_climber",
  "hiit",
];

export function CardioSelectSheet({
  isOpen,
  onClose,
  currentCardioType,
  onSelectCardio,
}: CardioSelectSheetProps) {
  const handleSelectCardio = (cardioType: CardioType) => {
    onSelectCardio(cardioType);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Select Cardio Type</SheetTitle>
          <SheetDescription>
            Choose your preferred cardio option for this workout
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 h-[calc(100%-120px)] overflow-y-auto pb-4">
          <div className="space-y-3">
            {allCardioTypes.map((cardioType) => {
              const template = getDefaultCardioTemplate(cardioType);
              const isSelected = currentCardioType === cardioType;

              return (
                <button
                  key={cardioType}
                  onClick={() => handleSelectCardio(cardioType)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {cardioTypeLabels[cardioType]}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Check className="h-3 w-3" />
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {template.durationMinutes} min • RPE {template.rpe}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {template.intensity}
                        </p>
                        {template.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            {template.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Done button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
          <Button
            onClick={onClose}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

