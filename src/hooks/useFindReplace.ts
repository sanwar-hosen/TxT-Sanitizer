import { useState, useMemo, useCallback } from 'react';

export interface SearchMatch {
  startIndex: number;
  endIndex: number;
}

export function useFindReplace(text: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = useMemo(() => {
    if (!query) return [];
    const searchMatches: SearchMatch[] = [];
    const targetText = caseSensitive ? text : text.toLowerCase();
    const searchStr = caseSensitive ? query : query.toLowerCase();
    
    let i = 0;
    while (i < targetText.length) {
      const idx = targetText.indexOf(searchStr, i);
      if (idx === -1) break;
      searchMatches.push({ startIndex: idx, endIndex: idx + searchStr.length });
      i = idx + searchStr.length;
    }
    return searchMatches;
  }, [text, query, caseSensitive]);

  // Handle activeIndex adjustment when matches change
  const validActiveIndex = useMemo(() => {
    if (matches.length === 0) return -1;
    if (activeIndex >= matches.length) return matches.length - 1;
    if (activeIndex === -1) return 0;
    return activeIndex;
  }, [matches.length, activeIndex]);

  // Keep internal state in sync without causing render loops
  if (validActiveIndex !== activeIndex) {
    setActiveIndex(validActiveIndex);
  }

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setReplaceText('');
    setActiveIndex(-1);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setQuery('');
      setReplaceText('');
    }
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    close,
    query,
    setQuery,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    matches,
    activeIndex: validActiveIndex,
    nextMatch,
    prevMatch,
  };
}
