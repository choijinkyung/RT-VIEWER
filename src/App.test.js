import React from 'react';
import { render } from '@testing-library/react';
import App from './app/App';

test('renders the patient file picker', () => {
  const { container } = render(<App />);
  const fileInput = container.querySelector('#filepicker');
  expect(fileInput).toBeInTheDocument();
});
