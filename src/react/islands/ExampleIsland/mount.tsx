import React from "react";
import { createRoot } from "react-dom/client";
import { EXAMPLE_ISLAND_POST_COUNTER_DEBOUNCE } from "../../../common/constants";

interface ExampleIslandProps {
  initialCount: number;
}

const ClientExampleIsland: React.FC<ExampleIslandProps> = ({
  initialCount,
}) => {
  const [count, setCount] = React.useState(initialCount);
  const debounceTimerId = React.useRef<number | null>(null);

  // Debounced POST request to update counter on server
  React.useEffect(() => {
    if (debounceTimerId.current !== null) {
      clearTimeout(debounceTimerId.current);
    }

    debounceTimerId.current = window.setTimeout(() => {
      console.log(`sending POST to update counter value at ${Date.now()}`);
      fetch("/example-island", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ counterValue: count }),
      }).catch((error) => {
        console.error("Failed to update counter on server:", error);
      });
    }, EXAMPLE_ISLAND_POST_COUNTER_DEBOUNCE);

    return () => {
      if (debounceTimerId.current !== null) {
        clearTimeout(debounceTimerId.current);
      }
    };
  }, [count]);

  return (
    <div className="govuk-panel" data-testid="example-island">
      <h2 className="govuk-heading-m">
        JavaScript enabled: client React component
      </h2>
      <p className="govuk-body">Count: {count}</p>
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
