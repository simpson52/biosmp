/**
 * contentEditable에서 텍스트 추출
 */
export function getTextFromEditable(element: HTMLElement | null): string {
  if (!element) return "";
  return element.textContent || "";
}

/**
 * HTML 이스케이프
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 커서 오프셋 계산 (변수 블록 고려)
 */
export function getCursorOffset(element: HTMLElement, range: Range): number {
  let offset = 0;
  const startContainer = range.startContainer;
  const startOffset = range.startOffset;
  
  // 변수 블록 내부에 커서가 있는지 확인
  let variableBlock: HTMLElement | null = null;
  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    variableBlock = (startContainer as HTMLElement).closest('.variable-block') as HTMLElement | null;
  } else if (startContainer.nodeType === Node.TEXT_NODE) {
    variableBlock = startContainer.parentElement?.closest('.variable-block') as HTMLElement | null;
  }
  
  // 변수 블록 내부에 커서가 있으면 블록의 끝 위치 반환
  if (variableBlock) {
    // 변수 블록 이전의 모든 텍스트 계산
    let node: Node | null = element.firstChild;
    while (node && node !== variableBlock) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += node.textContent?.length || 0;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains('variable-block')) {
          offset += el.textContent?.length || 0;
        } else {
          offset += el.textContent?.length || 0;
        }
      }
      node = node.nextSibling;
    }
    // 변수 블록의 텍스트 길이 추가
    offset += variableBlock.textContent?.length || 0;
    return offset;
  }
  
  // 일반 텍스트 노드 처리
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === startContainer) {
      offset += startOffset;
      break;
    }
    offset += node.textContent?.length || 0;
  }
  
  return offset;
}

/**
 * contentEditable에서 커서 위치 설정 (변수 블록 고려)
 */
export function setCursorInEditable(element: HTMLElement, position: number): void {
  const range = document.createRange();
  const selection = globalThis.getSelection();
  
  let currentPos = 0;
  let targetNode: Node | null = null;
  let targetOffset = 0;
  
  // 모든 노드를 순회 (텍스트 노드와 요소 노드 모두)
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );
  
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeLength = node.textContent?.length || 0;
      if (currentPos + nodeLength >= position) {
        targetNode = node;
        targetOffset = position - currentPos;
        break;
      }
      currentPos += nodeLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains('variable-block')) {
        const blockLength = el.textContent?.length || 0;
        if (currentPos + blockLength >= position) {
          // 변수 블록 내부 또는 바로 뒤에 커서를 위치시켜야 함
          // 변수 블록 뒤에 텍스트 노드가 있으면 그곳에, 없으면 변수 블록 뒤에 빈 텍스트 노드 생성
          if (position === currentPos + blockLength) {
            // 변수 블록 바로 뒤에 커서 위치
            const nextSibling = el.nextSibling;
            if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
              targetNode = nextSibling;
              targetOffset = 0;
            } else {
              // 텍스트 노드가 없으면 변수 블록 뒤에 생성
              const textNode = document.createTextNode("");
              el.parentElement?.insertBefore(textNode, el.nextSibling);
              targetNode = textNode;
              targetOffset = 0;
            }
          } else {
            // 변수 블록 내부 (이론적으로는 발생하지 않아야 함)
            targetNode = el.firstChild || el;
            targetOffset = position - currentPos;
          }
          break;
        }
        currentPos += blockLength;
      } else {
        // 일반 요소 노드의 텍스트 길이 추가
        const textLength = el.textContent?.length || 0;
        if (currentPos + textLength >= position) {
          // 요소 내부의 텍스트 노드를 찾아야 함
          const textWalker = document.createTreeWalker(
            el,
            NodeFilter.SHOW_TEXT,
            null
          );
          let textNode: Node | null;
          let innerPos = currentPos;
          while ((textNode = textWalker.nextNode())) {
            const nodeLength = textNode.textContent?.length || 0;
            if (innerPos + nodeLength >= position) {
              targetNode = textNode;
              targetOffset = position - innerPos;
              break;
            }
            innerPos += nodeLength;
          }
          if (targetNode) break;
        }
        currentPos += textLength;
      }
    }
  }
  
  // 커서 위치 설정
  if (targetNode) {
    if (targetNode.nodeType === Node.TEXT_NODE) {
      range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
      range.setEnd(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
    } else {
      // 요소 노드인 경우 (변수 블록)
      range.setStartAfter(targetNode);
      range.setEndAfter(targetNode);
    }
  } else {
    // 위치를 찾지 못한 경우 마지막에 커서 위치
    const lastNode = element.lastChild;
    if (lastNode) {
      if (lastNode.nodeType === Node.TEXT_NODE) {
        range.setStart(lastNode, lastNode.textContent?.length || 0);
        range.setEnd(lastNode, lastNode.textContent?.length || 0);
      } else {
        range.setStartAfter(lastNode);
        range.setEndAfter(lastNode);
      }
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
  }
  
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

