import { Suspense } from "react";
import { QuestionnaireClient } from "./QuestionnaireClient";

export default function QuestionnairePage() {
  return (
    <Suspense>
      <QuestionnaireClient />
    </Suspense>
  );
}
