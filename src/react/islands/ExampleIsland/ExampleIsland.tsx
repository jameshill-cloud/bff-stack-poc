import React from "react";

interface ExampleIslandProps {
  initialCount: number;
}

export const ExampleIsland: React.FC<ExampleIslandProps> = ({
  initialCount,
}) => (
  <div id="example-island" className="govuk-panel" data-testid="example-island">
    <h2 className="govuk-heading-m">Interactive Counter</h2>
    <p className="govuk-body">
      Initial count: <strong>{initialCount}</strong>
    </p>
    <button
      id="increment-btn"
      className="govuk-button"
      type="button"
      data-testid="increment-button"
    >
      Increment
    </button>
    <p id="counter-display" className="govuk-body">
      Current: {initialCount}
    </p>
  </div>
);
