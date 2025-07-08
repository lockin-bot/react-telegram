import type { TextWithEntities } from '@mtcute/bun';
import { tl } from '@mtcute/tl';
import type { RootNode, RowNode } from '@react-telegram/core';

export function rootNodeToTextWithEntities(root: RootNode): TextWithEntities {
  const text: string[] = [];
  const entities: tl.TypeMessageEntity[] = [];
  
  const processNode = (node: any) => {
    switch (node.type) {
      case 'text':
        text.push(node.content);
        break;
        
      case 'formatted':
        const startOffset = text.join('').length;
        node.children.forEach((child: any) => processNode(child));
        const length = text.join('').length - startOffset;
        
        if (length > 0) {
          switch (node.format) {
            case 'bold':
              entities.push({ _: 'messageEntityBold', offset: startOffset, length });
              break;
            case 'italic':
              entities.push({ _: 'messageEntityItalic', offset: startOffset, length });
              break;
            case 'underline':
              entities.push({ _: 'messageEntityUnderline', offset: startOffset, length });
              break;
            case 'strikethrough':
              entities.push({ _: 'messageEntityStrike', offset: startOffset, length });
              break;
            case 'spoiler':
              entities.push({ _: 'messageEntitySpoiler', offset: startOffset, length });
              break;
            case 'code':
              entities.push({ _: 'messageEntityCode', offset: startOffset, length });
              break;
          }
        }
        break;
        
      case 'link':
        const linkStartOffset = text.join('').length;
        node.children.forEach((child: any) => processNode(child));
        const linkLength = text.join('').length - linkStartOffset;
        
        if (linkLength > 0) {
          entities.push({ 
            _: 'messageEntityTextUrl', 
            offset: linkStartOffset, 
            length: linkLength,
            url: node.href 
          });
        }
        break;
        
      case 'custom-emoji':
        text.push(node.emoji);
        entities.push({
          _: 'messageEntityCustomEmoji',
          offset: text.join('').length - node.emoji.length,
          length: node.emoji.length,
          documentId: node.documentId
        });
        break;
        
      case 'br':
        text.push('\n');
        break;
        
      case 'pre':
        const preStartOffset = text.join('').length;
        text.push(node.content);
        entities.push({
          _: 'messageEntityPre',
          offset: preStartOffset,
          length: node.content.length,
          language: node.language || ''
        });
        break;
        
      case 'blockquote':
        const quoteStartOffset = text.join('').length;
        node.children.forEach((child: any) => processNode(child));
        const quoteLength = text.join('').length - quoteStartOffset;
        
        if (quoteLength > 0) {
          entities.push({
            _: 'messageEntityBlockquote',
            offset: quoteStartOffset,
            length: quoteLength,
            collapsed: node.expandable
          });
        }
        break;
        
      case 'row':
        // Rows are handled separately for inline keyboard
        break;
    }
  };
  
  // Process all non-row children
  root.children
    .filter(child => child.type !== 'row')
    .forEach(child => processNode(child));
  
  return {
    text: text.join(''),
    entities
  };
}

export function rootNodeToInlineKeyboard(root: RootNode, containerId: string): tl.RawReplyInlineMarkup | undefined {
  const rows = root.children.filter(child => child.type === 'row') as RowNode[];
  
  if (rows.length === 0) return undefined;
  
  const keyboard: tl.TypeKeyboardButton[][] = rows.map(row => 
    row.children.map(button => ({
      _: 'keyboardButtonCallback',
      text: button.text,
      data: Buffer.from(`${containerId}:${button.id}`)
    }) as tl.TypeKeyboardButton)
  );
  
  return { _: 'replyInlineMarkup', rows: keyboard.map(row => ({ _: 'keyboardButtonRow', buttons: row })) };
}