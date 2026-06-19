import { Intent } from "@alfa/shared";

export class IntentDiff {
  public calculateDrift(intent: Intent, textContent: string): { intentPreserved: boolean; reason?: string } {
    const textLower = textContent.toLowerCase();

    // 1. Sprawdzanie czy na stronie występują zakazane przesunięcia (forbidden_shifts)
    for (const shift of intent.forbidden_shifts) {
      const shiftLower = shift.toLowerCase();
      // Prosty regex lub wyszukiwanie fraz
      if (textLower.includes(shiftLower)) {
        return {
          intentPreserved: false,
          reason: `Wykryto zakazane przesunięcie intencji (forbidden shift): "${shift}" obecne w treści strony.`
        };
      }
    }

    // 2. Detekcja prób zmiany celu (np. "forget previous goal", "new task is")
    const changeIndicators = [
      "new task is",
      "new goal is",
      "instead of doing",
      "change your task",
      "change your goal",
      "forget your goal",
      "forget your task"
    ];

    for (const indicator of changeIndicators) {
      if (textLower.includes(indicator)) {
        return {
          intentPreserved: false,
          reason: `Wykryto próbę modyfikacji celu agenta za pomocą frazy: "${indicator}".`
        };
      }
    }

    return {
      intentPreserved: true
    };
  }
}

export const intentDiff = new IntentDiff();
