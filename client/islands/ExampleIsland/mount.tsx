import React from 'react';
import { createRoot } from 'react-dom/client';

interface ExampleIslandProps {
  initialCount: number;
}

const ClientExampleIsland: React.FC<ExampleIslandProps> = ({
  initialCount,
}) => {
  const [count, setCount] = React.useState(initialCount);

  const handleIncrement = () => {
    setCount((c) => c + 1);
  };

  return (
    <div className="govuk-panel" data-testid="example-island">
      <h2 className="govuk-heading-m">Interactive Counter</h2>
      <p className="govuk-body">
        Initial count: <strong>{initialCount}</strong>
      </p>
      <button
        className="govuk-button"
        type="button"
        data-testid="increment-button"
        onClick={handleIncrement}
      >
        Increment
      </button>
      <p className="govuk-body">Current: {count}</p>
    </div>
  );
};

export default (el: HTMLElement, props: ExampleIslandProps) => {
  // Hide the fallback when JavaScript is available
  const fallback = document.getElementById('example-island-fallback');
  if (fallback) {
    fallback.classList.add('js-hidden');
  }

  const root = createRoot(el);
  root.render(<ClientExampleIsland {...props} />);
};
