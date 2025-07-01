import type { ReactNode } from 'react';

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
      
      // Interactive elements
      row: {
        children?: ReactNode;
      };
      
      button: {
        onClick?: () => void;
        children?: ReactNode;
      };
      
      input: {
        onSubmit?: (text: string) => void;
        autoDelete?: boolean;
      };
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

export interface TelegramRowNode {
  type: 'row';
  children: TelegramButtonNode[];
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