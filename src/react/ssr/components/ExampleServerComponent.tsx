import React from 'react';

interface ExampleServerComponentProps {
  title: string;
  message: string;
}

export const ExampleServerComponent: React.FC<ExampleServerComponentProps> = ({
  title,
  message,
}) => (
  <div className="govuk-panel govuk-panel--confirmation">
    <h1 className="govuk-panel__title">{title}</h1>
    <div className="govuk-panel__body">{message}</div>
  </div>
);
