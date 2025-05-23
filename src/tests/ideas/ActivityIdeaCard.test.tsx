import React from "react";
import { render, screen } from "@testing-library/react";
import { ActivityIdeaCard, createActivityIdea, ActivityIdea } from "../../components/Ideas/idea_types/ActivityIdea";

describe("ActivityIdeaCard", () => {
  // Test Case 4
  test("displays price range correctly (e.g., $10 - $50)", () => {
    const idea = createActivityIdea("Test Idea") as ActivityIdea;
    idea.price_low = 10;
    idea.price_high = 50;
    render(<ActivityIdeaCard subitem={idea} />);
    expect(screen.getByText("$10 - $50")).toBeInTheDocument();
  });

  // Test Case 5
  test("displays single price if price_low === price_high (e.g., $20)", () => {
    const idea = createActivityIdea("Test Idea") as ActivityIdea;
    idea.price_low = 20;
    idea.price_high = 20;
    render(<ActivityIdeaCard subitem={idea} />);
    expect(screen.getByText("$20")).toBeInTheDocument();
  });

  // Test Case 6
  test('displays "At least $X" if only price_low is set and > 0', () => {
    const idea = createActivityIdea("Test Idea") as ActivityIdea;
    idea.price_low = 15;
    idea.price_high = 0; // or undefined, based on createActivityIdea
    render(<ActivityIdeaCard subitem={idea} />);
    expect(screen.getByText("At least $15")).toBeInTheDocument();
  });

  // Test Case 7
  test('displays "Up to $Y" if only price_high is set and > 0', () => {
    const idea = createActivityIdea("Test Idea") as ActivityIdea;
    idea.price_low = 0; // or undefined
    idea.price_high = 70;
    render(<ActivityIdeaCard subitem={idea} />);
    expect(screen.getByText("Up to $70")).toBeInTheDocument();
  });

  // Test Case 8
  test("does not display price if neither is set (or both are 0)", () => {
    const idea = createActivityIdea("Test Idea") as ActivityIdea;
    idea.price_low = 0;
    idea.price_high = 0;
    render(<ActivityIdeaCard subitem={idea} />);
    // Check that "Estimated Cost" label is not present, implying price is not shown
    expect(screen.queryByText("Estimated Cost")).not.toBeInTheDocument();
    // Also check that no text starting with $ is present
    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
     // Check specific patterns are not present
    expect(screen.queryByText(/\$\d+ - \$\d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/At least \$\d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Up to \$\d+/)).not.toBeInTheDocument();
  });
});
