import React from "react";
import { createRoot } from "react-dom/client";

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
    // Clear existing timeout if count changes again
    if (debounceTimerId.current !== null) {
      clearTimeout(debounceTimerId.current);
    }

    // Set new timeout for debounced request
    debounceTimerId.current = window.setTimeout(() => {
      // Send POST request with new counter value (no action field)
      fetch("/example-island", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ counterValue: count }),
      }).catch((error) => {
        console.error("Failed to update counter on server:", error);
      });
    }, 500); // 500ms debounce

    // Cleanup function to clear timeout on unmount
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
