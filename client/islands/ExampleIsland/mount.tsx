import React from "react";
import { createRoot } from "react-dom/client";

interface ExampleIslandProps {
  initialCount: number;
}

const ClientExampleIsland: React.FC<ExampleIslandProps> = ({
  initialCount,
}) => {
  const [count, setCount] = React.useState(initialCount);

  return (
    <div className="govuk-panel" data-testid="example-island">
      <h2 className="govuk-heading-m">
        JavaScript enabled: client React component
      </h2>
      <p className="govuk-body">
        Initial count: <strong>{initialCount}</strong>
      </p>
      <p className="govuk-body">Current: {count}</p>
      <div style={{ display: "inline-flex", gap: 8 }}>
        <button
          className="govuk-button"
          type="button"
          data-testid="increment-button"
          onClick={() => setCount((c) => c - 1)}
        >
          Decrement
        </button>
        <button
          className="govuk-button"
          type="button"
          data-testid="increment-button"
          onClick={() => setCount((c) => c + 1)}
        >
          Increment
        </button>
      </div>
    </div>
  );
};

export default (el: HTMLElement, props: ExampleIslandProps) => {
  // Hide the fallback when JavaScript is available
  const fallback = document.getElementById("example-island-fallback");
  if (fallback) {
    fallback.classList.add("js-hidden");
  }

  const root = createRoot(el);
  root.render(<ClientExampleIsland {...props} />);
};
