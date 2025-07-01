import type { ReactNode, ReactElement } from 'react';

type ButtonElement = ReactElement<{
  onClick?: () => void;
  children?: ReactNode;
}, 'button'>;

type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : TupleOf<T, N, []> : never;
type TupleOf<T, N extends number, R extends readonly unknown[]> = R['length'] extends N ? R : TupleOf<T, N, readonly [T, ...R]>;


type ButtonArray<N extends number> = N extends 1 ? ButtonElement | [ButtonElement]
  : N extends 2 ? ButtonElement | [ButtonElement] | [ButtonElement, ButtonElement]
  : N extends 3 ? ButtonElement | [ButtonElement] | [ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement]
  : N extends 4 ? ButtonElement | [ButtonElement] | [ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement]
  : N extends 5 ? ButtonElement | [ButtonElement] | [ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement]
  : N extends 8 ? ButtonElement | [ButtonElement] | [ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement] | [ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement, ButtonElement]
  : never;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // Text formatting elements
      b: { children?: ReactNode };
      strong: { children?: ReactNode };
      i: { children?: ReactNode };
      em: { children?: ReactNode };
      u: { children?: ReactNode };
      ins: { children?: ReactNode };
      s: { children?: ReactNode };
      strike: { children?: ReactNode };
      del: { children?: ReactNode };
      code: { children?: ReactNode; class?: string };
      
      // Span with special className
      span: {
        className?: 'tg-spoiler' | string;
        children?: ReactNode;
      };
      
      // Custom Telegram elements
      'tg-spoiler': { children?: ReactNode };
      'tg-emoji': {
        emojiId: string;
        'emoji-id'?: string; // Alternative attribute name
        children?: ReactNode; // Fallback emoji
      };
      
      // Link element
      a: {
        href: string;
        children?: ReactNode;
      };
      
      // Code blocks
      pre: { 
        children?: ReactNode;
      };
      
      // Blockquote
      blockquote: {
        expandable?: boolean;
        children?: ReactNode;
      };
      
      // Interactive element with strict validation
      row: {
        children: ButtonArray<8>;
      };
      
      button: {
        onClick?: () => void;
        children?: ReactNode;
      };
      
      input: {
        onSubmit?: (text: string) => void;
        autoDelete?: boolean;
      };
      
      // Line break
      br: {};
    }
  }
}

// Export types for the reconciler output
export interface TelegramTextNode {
  type: 'text';
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    spoiler?: boolean;
    code?: boolean;
  };
}

export interface TelegramFormattedNode {
  type: 'formatted';
  format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code';
  children: (TelegramTextNode | TelegramFormattedNode | TelegramLinkNode)[];
}

export interface TelegramLinkNode {
  type: 'link';
  href: string;
  children: (TelegramTextNode | TelegramFormattedNode)[];
}

export interface TelegramEmojiNode {
  type: 'emoji';
  emojiId: string;
  fallback?: string;
}

export interface TelegramCodeBlockNode {
  type: 'codeblock';
  content: string;
  language?: string;
}

export interface TelegramBlockQuoteNode {
  type: 'blockquote';
  children: (TelegramTextNode | TelegramFormattedNode)[];
  expandable?: boolean;
}

export interface TelegramButtonNode {
  type: 'button';
  id: string;
  text: string;
  onClick?: () => void;
}

type TelegramButtonArray<N extends number> = N extends 1 ? [TelegramButtonNode]
  : N extends 2 ? [TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode]
  : N extends 3 ? [TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode]
  : N extends 4 ? [TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode]
  : N extends 5 ? [TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode]
  : N extends 8 ? [TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode] | [TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode, TelegramButtonNode]
  : never;

export interface TelegramRowNode {
  type: 'row';
  children: TelegramButtonArray<8>;
}

export interface TelegramInputNode {
  type: 'input';
  onSubmit?: (text: string) => void;
  autoDelete?: boolean;
}

export interface TelegramRootNode {
  type: 'root';
  children: (
    | TelegramTextNode 
    | TelegramFormattedNode 
    | TelegramLinkNode 
    | TelegramEmojiNode 
    | TelegramCodeBlockNode 
    | TelegramBlockQuoteNode 
    | TelegramRowNode
    | TelegramInputNode
  )[];
}

export type TelegramNode = 
  | TelegramTextNode
  | TelegramFormattedNode
  | TelegramLinkNode
  | TelegramEmojiNode
  | TelegramCodeBlockNode
  | TelegramBlockQuoteNode
  | TelegramButtonNode
  | TelegramRowNode
  | TelegramInputNode
  | TelegramRootNode;