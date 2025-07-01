# @react-telegram/core

Core React reconciler for building Telegram bots with React components.

## Installation

```bash
bun add @react-telegram/core react
```

## Usage

```tsx
import { createContainer } from '@react-telegram/core';

const { render, container } = createContainer();

const App = () => (
  <>
    <b>Hello Telegram!</b>
    <br />
    <i>Built with React</i>
  </>
);

render(<App />);
console.log(container.root);
```

## Supported Elements

### Text Formatting
- `<b>`, `<strong>` - Bold text
- `<i>`, `<em>` - Italic text
- `<u>`, `<ins>` - Underlined text
- `<s>`, `<strike>`, `<del>` - Strikethrough text
- `<code>` - Inline code
- `<pre>` - Code blocks
- `<br />` - Line breaks

### Telegram-specific
- `<tg-spoiler>` - Spoiler text
- `<tg-emoji>` - Custom emoji
- `<blockquote>` - Quotes (with optional `expandable` prop)
- `<a>` - Links

### Interactive Elements
- `<button>` - Inline keyboard buttons
- `<row>` - Button row container
- `<input>` - Text input handler

## TypeScript Support

This package includes full TypeScript definitions. The JSX elements are automatically typed when you import the package.

## License

MIT