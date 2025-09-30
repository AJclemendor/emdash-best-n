import { useEffect, useState } from 'react'
import type { CodexModel, CodexReasoningEffort } from '../types/chat'

export function useCodexSettings(workspaceId: string) {
  const [model, setModel] = useState<CodexModel>('gpt-5')
  const [reasoningEffort, setReasoningEffort] = useState<CodexReasoningEffort>('high')

  // Restore settings from localStorage when workspace changes
  useEffect(() => {
    try {
      const modelKey = `codexModel:${workspaceId}`
      const effortKey = `codexReasoningEffort:${workspaceId}`

      const savedModel = localStorage.getItem(modelKey) as CodexModel | null
      const savedEffort = localStorage.getItem(effortKey) as CodexReasoningEffort | null

      if (savedModel && (savedModel === 'gpt-5' || savedModel === 'gpt-5-codex')) {
        setModel(savedModel)
      }

      if (savedEffort && (savedEffort === 'low' || savedEffort === 'medium' || savedEffort === 'high')) {
        setReasoningEffort(savedEffort)
      }
    } catch (error) {
      console.error('Failed to load codex settings from localStorage:', error)
    }
  }, [workspaceId])

  // Persist settings to localStorage when they change
  useEffect(() => {
    try {
      const modelKey = `codexModel:${workspaceId}`
      const effortKey = `codexReasoningEffort:${workspaceId}`

      localStorage.setItem(modelKey, model)
      localStorage.setItem(effortKey, reasoningEffort)
    } catch (error) {
      console.error('Failed to save codex settings to localStorage:', error)
    }
  }, [model, reasoningEffort, workspaceId])

  return {
    model,
    setModel,
    reasoningEffort,
    setReasoningEffort,
  }
}
