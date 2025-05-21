import { TravelIdea } from "./idea_types/TravelIdea";
import { EatingIdea } from "./idea_types/EatingIdea";
import { SightseeingIdea } from "./idea_types/SightseeingIdea";
import { ActivityIdea } from "./idea_types/ActivityIdea";
import { AccommodationIdea } from "./idea_types/AccommodationIdea";
import { BaseIdea, ideaFactory, IdeasAppState } from "./idea_types/BaseIdea";

export type CategoryType =
  | "Travel"
  | "Eating"
  | "Sightseeing"
  | "Activities"
  | "Accommodation";

interface IdeaType extends BaseIdea {
  title: string;
  content?: string;
  category: CategoryType;
  subitems?: Array<
    TravelIdea | EatingIdea | SightseeingIdea | ActivityIdea | AccommodationIdea
  >;
}

export const handleSublistKeyPress = (
  e: KeyboardEvent,
  parentIdx: number,
  category: CategoryType,
  ideas: IdeaType[]
): BaseIdea | null => {
  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
    const name = (e.target as HTMLInputElement).value.trim();
    return ideaFactory(category, name);
  }
  return null;
};

export const saveIdeasAppStateToLocalStorage = (state: IdeasAppState) => {
  try {
    localStorage.setItem("ideasAppState", JSON.stringify(state));
  } catch (e) {
    // Optionally handle error
  }
};

export type { IdeaType };
