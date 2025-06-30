import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority, NoEventPriority } from 'react-reconciler/constants';
import type {
  TelegramTextNode as TextNode,
  TelegramFormattedNode as FormattedNode,
  TelegramLinkNode as LinkNode,
  TelegramEmojiNode as EmojiNode,
  TelegramCodeBlockNode as CodeBlockNode,
  TelegramBlockQuoteNode as BlockQuoteNode,
  TelegramButtonNode as ButtonNode,
  TelegramRowNode as RowNode,
  TelegramRootNode as RootNode,
  TelegramNode as Node
} from './jsx';

// Re-export types for convenience
export type {
  TextNode,
  FormattedNode,
  LinkNode,
  EmojiNode,
  CodeBlockNode,
  BlockQuoteNode,
  ButtonNode,
  RowNode,
  RootNode,
  Node
};

interface Container {
  root: RootNode;
  buttonHandlers: Map<string, () => void>;
  onRenderContainer?: (root: RootNode) => void;
}

let currentUpdatePriority: number = NoEventPriority;

const hostConfig: any = {
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
  cloneInstance(
    instance: any,
    type: string,
    oldProps: any,
    newProps: any,
    internalInstanceHandle: any,
    keepChildren: boolean,
    recyclableInstance: any
  ) {
    // Deep clone the instance
    const clone = JSON.parse(JSON.stringify(instance));
    
    // Preserve functions
    if (instance.onClick) {
      clone.onClick = instance.onClick;
    }
    
    // Update props if needed
    if (newProps.onClick && clone.type === 'button') {
      clone.onClick = newProps.onClick;
    }
    
    // Update button text from props
    if (clone.type === 'button' && typeof newProps.children === 'string') {
      clone.text = newProps.children;
    }
    
    // Handle children
    if (keepChildren && instance.children) {
      // Keep the original children array reference
      clone.children = instance.children;
    } else if (!keepChildren && 'children' in clone) {
      // Clear children, they will be rebuilt
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
  },

  replaceContainerChildren(container: Container, newChildren: any[]) {
    container.root.children = newChildren;
    hostConfig.resetAfterCommit(container);
    if (container.onRenderContainer) {
      container.onRenderContainer(container.root);
    }
  },
  
  completeWork(instance: any, type: string, props: any, internalInstanceHandle: any) {
    // This is called after all children have been appended
    return instance;
  },

  cloneHiddenInstance(instance: any, type: string, props: any) {
    return hostConfig.cloneInstance!(instance, type, props, props, null, true, null);
  },

  cloneHiddenTextInstance(instance: any) {
    // Text instances are simple clones
    return JSON.parse(JSON.stringify(instance));
  },

  getPublicInstance(instance: any) {
    return instance;
  },



  // Persistence child building
  appendChild(parent: any, child: any) {
    if ('children' in parent && Array.isArray(parent.children)) {
      parent.children.push(child);
    } else if (parent.type === 'codeblock' && child.type === 'text') {
      parent.content = child.content;
    }
  },

  appendChildToContainer(container: Container, child: any) {
    container.root.children.push(child);
  },
  
  appendInitialChildToContainer(container: Container, child: any) {
    container.root.children.push(child);
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
  
  // Additional persistence methods
  appendAllChildren: () => {},
  finalizeInitialChildrenPersistent: () => false,

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
  HostTransitionContext: null as any,
  
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
    TelegramReconciler.injectIntoDevTools = () => false;
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