'use client'

import { useCallback } from 'react'
import { gtag } from '@/components/Analytics'

export interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    gtag.event(event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event
    })
  }, [])

  const trackPageView = useCallback((url: string) => {
    gtag.pageview(url)
  }, [])

  // Eventos específicos do site
  const trackVideoPlay = useCallback((videoId: string, videoTitle?: string) => {
    trackEvent({
      action: 'video_play',
      category: 'video',
      label: videoTitle || videoId,
      video_id: videoId
    })
  }, [trackEvent])

  const trackVideoPause = useCallback((videoId: string, videoTitle?: string) => {
    trackEvent({
      action: 'video_pause',
      category: 'video',
      label: videoTitle || videoId,
      video_id: videoId
    })
  }, [trackEvent])

  const trackPremiumSignup = useCallback((plan?: string) => {
    trackEvent({
      action: 'premium_signup',
      category: 'premium',
      label: plan,
      value: 1
    })
  }, [trackEvent])

  const trackPremiumPurchase = useCallback((plan: string, value: number) => {
    trackEvent({
      action: 'purchase',
      category: 'premium',
      label: plan,
      value: value
    })
  }, [trackEvent])

  const trackCreatorView = useCallback((creatorId: string, creatorName?: string) => {
    trackEvent({
      action: 'creator_view',
      category: 'creator',
      label: creatorName || creatorId,
      creator_id: creatorId
    })
  }, [trackEvent])

  const trackSearch = useCallback((query: string, results?: number) => {
    trackEvent({
      action: 'search',
      category: 'search',
      label: query,
      value: results
    })
  }, [trackEvent])

  const trackCategoryView = useCallback((category: string) => {
    trackEvent({
      action: 'category_view',
      category: 'category',
      label: category
    })
  }, [trackEvent])

  const trackContactForm = useCallback((formType: string) => {
    trackEvent({
      action: 'contact_form_submit',
      category: 'contact',
      label: formType
    })
  }, [trackEvent])

  const trackAgeVerification = useCallback((verified: boolean) => {
    trackEvent({
      action: 'age_verification',
      category: 'age_verification',
      label: verified ? 'verified' : 'rejected'
    })
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackVideoPlay,
    trackVideoPause,
    trackPremiumSignup,
    trackPremiumPurchase,
    trackCreatorView,
    trackSearch,
    trackCategoryView,
    trackContactForm,
    trackAgeVerification
  }
}
