'use client';

import { useEffect, useMemo, useState } from 'react';

import type { StoryComment } from './story-types';

interface StoryInteractionState {
  helpfulStoryIds: string[];
  commentsByStoryId: Record<string, StoryComment[]>;
  importedStoryIds: string[];
}

const STORAGE_KEY = 'buting-stories-interactions';

const initialState: StoryInteractionState = {
  helpfulStoryIds: [],
  commentsByStoryId: {},
  importedStoryIds: [],
};

export function useStoryInteractions(storyId: string, defaultComments: StoryComment[]) {
  const [state, setState] = useState<StoryInteractionState>(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(STORAGE_KEY);
      if (!savedValue) {
        setState(initialState);
        setIsReady(true);
        return;
      }

      const parsedValue = JSON.parse(savedValue) as StoryInteractionState;
      setState({
        helpfulStoryIds: parsedValue.helpfulStoryIds ?? [],
        commentsByStoryId: parsedValue.commentsByStoryId ?? {},
        importedStoryIds: parsedValue.importedStoryIds ?? [],
      });
      setIsReady(true);
    } catch {
      setState(initialState);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isReady, state]);

  const comments = useMemo(() => {
    const savedComments = state.commentsByStoryId[storyId];
    return savedComments && savedComments.length > 0 ? savedComments : defaultComments;
  }, [defaultComments, state.commentsByStoryId, storyId]);

  const isHelpful = state.helpfulStoryIds.includes(storyId);
  const isImported = state.importedStoryIds.includes(storyId);

  const toggleHelpful = () => {
    setState((current) => {
      const alreadyHelpful = current.helpfulStoryIds.includes(storyId);
      return {
        ...current,
        helpfulStoryIds: alreadyHelpful
          ? current.helpfulStoryIds.filter((id) => id !== storyId)
          : [...current.helpfulStoryIds, storyId],
      };
    });
  };

  const addComment = (author: string, content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    const nextComment: StoryComment = {
      id: `${storyId}-${Date.now()}`,
      author,
      content: trimmedContent,
      createdAt: '방금 전',
    };

    setState((current) => ({
      ...current,
      commentsByStoryId: {
        ...current.commentsByStoryId,
        [storyId]: [...comments, nextComment],
      },
    }));
  };

  const markImported = () => {
    setState((current) => ({
      ...current,
      importedStoryIds: current.importedStoryIds.includes(storyId)
        ? current.importedStoryIds
        : [...current.importedStoryIds, storyId],
    }));
  };

  return {
    comments,
    isHelpful,
    isImported,
    toggleHelpful,
    addComment,
    markImported,
  };
}
