import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority, NoEventPriority } from 'react-reconciler/constants';

export interface TextNode {
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

export interface LinkNode {
  type: 'link';
  href: string;
  children: (TextNode | FormattedNode)[];
}

export interface EmojiNode {
  type: 'emoji';
  emojiId: string;
  fallback?: string;
}

export interface CodeBlockNode {
  type: 'codeblock';
  content: string;
  language?: string;
}

export interface BlockQuoteNode {
  type: 'blockquote';
  children: (TextNode | FormattedNode)[];
  expandable?: boolean;
}

export interface FormattedNode {
  type: 'formatted';
  format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code';
  children: (TextNode | FormattedNode | LinkNode)[];
}

export interface ButtonNode {
  type: 'button';
  id: string;
  text: string;
  onClick?: () => void;
}

export interface RowNode {
  type: 'row';
  children: ButtonNode[];
}

export interface RootNode {
  type: 'root';
  children: (TextNode | FormattedNode | LinkNode | EmojiNode | CodeBlockNode | BlockQuoteNode | RowNode)[];
}

type Node = TextNode | FormattedNode | LinkNode | EmojiNode | CodeBlockNode | BlockQuoteNode | ButtonNode | RowNode | RootNode;

interface Container {
  root: RootNode;
  buttonHandlers: Map<string, () => void>;
}

let currentUpdatePriority: number = NoEventPriority;

const hostConfig: ReactReconciler.HostConfig<
  string, // Type
  any, // Props
  Container, // Container
  Node, // Instance
  TextNode, // TextInstance
  any, // SuspenseInstance
  any, // HydratableInstance
  any, // PublicInstance
  any, // HostContext
  any, // UpdatePayload
  any, // ChildSet
  any, // TimeoutHandle
  any // NoTimeout
> = {
  supportsMutation: false,
  supportsPersistence: true,

  createInstance(type: string, props: any) {
    switch (type) {
      case 'b':
      case 'strong':
        return { type: 'formatted', format: 'bold', children: [] };
      case 'i':
      case 'em':
        return { type: 'formatted', format: 'italic', children: [] };
      case 'u':
      case 'ins':
        return { type: 'formatted', format: 'underline', children: [] };
      case 's':
      case 'strike':
      case 'del':
        return { type: 'formatted', format: 'strikethrough', children: [] };
      case 'span':
        if (props.className === 'tg-spoiler') {
          return { type: 'formatted', format: 'spoiler', children: [] };
        }
        return { type: 'formatted', format: 'bold', children: [] }; // default
      case 'tg-spoiler':
        return { type: 'formatted', format: 'spoiler', children: [] };
      case 'a':
        return { type: 'link', href: props.href || '', children: [] };
      case 'tg-emoji':
        return { type: 'emoji', emojiId: props['emoji-id'] || props.emojiId || '', fallback: props.children };
      case 'code':
        return { type: 'formatted', format: 'code', children: [] };
      case 'pre':
        return { type: 'codeblock', content: '', language: undefined };
      case 'blockquote':
        return { type: 'blockquote', children: [], expandable: props.expandable };
      case 'button':
        const buttonText = typeof props.children === 'string' ? props.children : '';
        return { type: 'button', id: '', text: buttonText, onClick: props.onClick };
      case 'row':
        return { type: 'row', children: [] };
      default:
        return { type: 'formatted', format: 'bold', children: [] };
    }
  },

  createTextInstance(text: string) {
    return { type: 'text', content: text };
  },

  appendInitialChild(parent: any, child: any) {
    if ('children' in parent && Array.isArray(parent.children)) {
      parent.children.push(child);
    } else if (parent.type === 'codeblock' && child.type === 'text') {
      parent.content = child.content;
    } else if (parent.type === 'codeblock' && child.type === 'formatted' && child.format === 'code') {
      // Handle <pre><code class="language-x">...</code></pre>
      if (child.children.length > 0 && child.children[0].type === 'text') {
        parent.content = child.children[0].content;
        // Extract language from props if available
        const codeChild = child as any;
        if (codeChild.props?.className?.startsWith('language-')) {
          parent.language = codeChild.props.className.replace('language-', '');
        }
      }
    }
  },

  finalizeInitialChildren() {
    return false;
  },

  prepareForCommit() {
    return null;
  },

  resetAfterCommit(container: Container) {
    // Assign button IDs after commit
    let rowIndex = 0;
    container.root.children.forEach((child: any) => {
      if (child.type === 'row') {
        child.children.forEach((button: ButtonNode, buttonIndex: number) => {
          if (button.type === 'button') {
            button.id = `${rowIndex}-${buttonIndex}`;
          }
        });
        rowIndex++;
      }
    });
    
    // Store button handlers
    container.buttonHandlers.clear();
    container.root.children.forEach((child: any) => {
      if (child.type === 'row') {
        child.children.forEach((button: ButtonNode) => {
          if (button.onClick) {
            container.buttonHandlers.set(button.id, button.onClick);
          }
        });
      }
    });
    
    // Don't log automatically
  },

  preparePortalMount() {},

  getRootHostContext() {
    return {};
  },

  getChildHostContext() {
    return {};
  },

  shouldSetTextContent() {
    return false;
  },

  // Persistence methods
  cloneInstance(instance: any) {
    // Deep clone but preserve functions
    const clone = JSON.parse(JSON.stringify(instance));
    if (instance.onClick) {
      clone.onClick = instance.onClick;
    }
    // Clear children for containers - they'll be rebuilt
    if (clone.children) {
      clone.children = [];
    }
    return clone;
  },

  createContainerChildSet() {
    return [];
  },

  appendChildToContainerChildSet(childSet: any[], child: any) {
    childSet.push(child);
  },

  finalizeContainerChildren(container: Container, newChildren: any[]) {
    container.root.children = newChildren;
    hostConfig.resetAfterCommit(container);
  },

  replaceContainerChildren(container: Container, newChildren: any[]) {
    container.root.children = newChildren;
    hostConfig.resetAfterCommit(container);
  },

  cloneHiddenInstance(instance: any) {
    return this.cloneInstance(instance);
  },

  cloneHiddenTextInstance(instance: any) {
    return this.cloneInstance(instance);
  },

  getPublicInstance(instance: any) {
    return instance;
  },

  prepareUpdate() {
    return null;
  },

  shouldDeprioritizeSubtree() {
    return false;
  },

  // Persistence child building
  appendChild(parent: any, child: any) {
    if (!parent.children) parent.children = [];
    parent.children.push(child);
  },
  
  // Clear existing children when building new tree
  createContainerChildSet() {
    return [];
  },

  appendChildToContainer(container: Container, child: any) {
    // Not used in persistence mode
  },

  // Stubs for mutation mode methods (not used in persistence)
  insertBefore: () => {},
  insertInContainerBefore: () => {},
  removeChild: () => {},
  removeChildFromContainer: () => {},
  commitTextUpdate: () => {},
  commitMount: () => {},
  commitUpdate: () => {},
  clearContainer: () => {},

  // Scheduling
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  supportsHydration: false,
  
  // React 19 compatibility
  getCurrentEventPriority: () => DefaultEventPriority,
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
  detachDeletedInstance: () => {},
  
  // Update priority management
  setCurrentUpdatePriority: (newPriority: number) => {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority: () =>
    currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority,
  
  // Additional React 19 methods
  resetFormInstance: () => {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1.1,
  requestPostPaintCallback: () => {},
  maySuspendCommit: () => false,
  preloadInstance: () => true,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,
  NotPendingTransition: null,
  HostTransitionContext: null,
  
  // Microtask support
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,
};

export const TelegramReconciler = ReactReconciler(hostConfig);

export function createContainer() {
  const container: Container = {
    root: { type: 'root', children: [] },
    buttonHandlers: new Map(),
  };
  
  const reconcilerContainer = TelegramReconciler.createContainer(
    container,
    1, // Use legacy mode for synchronous updates
    null,
    false,
    null,
    '',
    () => {},
    null
  );
  
  // Set up required functions for React 19
  if (!TelegramReconciler.injectIntoDevTools) {
    TelegramReconciler.injectIntoDevTools = () => {};
  }
  
  return {
    container,
    reconcilerContainer,
    render: (element: React.ReactElement) => {
      TelegramReconciler.updateContainer(element, reconcilerContainer, null, () => {});
    },
    getOutput: () => container.root,
    clickButton: (buttonId: string) => {
      const handler = container.buttonHandlers.get(buttonId);
      if (handler) {
        handler();
      }
    },
  };
}