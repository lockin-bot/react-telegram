/// <reference types="@react-telegram/core" />
import React from 'react';
import { createContainer } from '@react-telegram/core';

// Demo showcasing <br /> tag support
const BrDemo: React.FC = () => {
  return (
    <>
      <b>Line Break Demo</b>
      <br />
      <br />
      This demonstrates the new <code>&lt;br /&gt;</code> tag support.
      <br />
      <br />
      <i>Benefits:</i>
      <br />
      • Cleaner JSX syntax
      <br />
      • More intuitive for React developers
      <br />
      • No more {'\\n'} strings
      <br />
      <br />
      <b>Example Usage:</b>
      <br />
      <pre>{`<b>Title</b>
<br />
<i>Subtitle</i>
<br />
<br />
Content here...`}</pre>
    </>
  );
};

// Create container and render
const { render, container } = createContainer();
render(<BrDemo />);

// Log the output
setTimeout(() => {
  console.log('Line break demo output:');
  console.log(JSON.stringify(container.root, null, 2));
}, 0);