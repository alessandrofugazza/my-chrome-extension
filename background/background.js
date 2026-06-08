chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_POPUP') {
    chrome.action.setPopup({ popup: message.popup }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        sendResponse({ ok: false, error: chrome.runtime.lastError.message })
        return
      }

      sendResponse({ ok: true })
    })

    return true
  }
})

chrome.runtime.onMessage.addListener((msg, sender) => {
  const msgType = msg?.type
  const tabId = sender?.tab?.id
  if (msgType === 'PAGE_HAS_NOTES') {
    if (tabId != null) {
      chrome.action.setBadgeText({ tabId, text: 'NOTE' })
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#d97706' })
    }

    chrome.notifications.create(
      {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('images/icon.png'),
        title: 'Page has notes',
        message: `Loaded: ${msg.url}`,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError.message)
          return
        }
      },
    )
  } else if (msgType === 'PAGE_HAS_NO_NOTES') {
    if (tabId != null) {
      chrome.action.setBadgeText({ tabId, text: '' })
    }
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return

  const [tab] = await chrome.tabs.query({
    active: true,
    windowId,
  })

  if (!tab?.id || !tab.url) return

  // Ignore pages where content scripts cannot run
  if (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('about:') ||
    tab.url.startsWith('chrome-extension://')
  ) {
    return
  }

  chrome.tabs.sendMessage(tab.id, { type: 'WINDOW_WAS_FOCUSED' }, () => {
    if (chrome.runtime.lastError) {
      console.log('No content script in this tab:', chrome.runtime.lastError.message)
      return
    }
  })
})

// IN PROGRESS PAGES NOTIFICATIONS

const ALARM_NAME = 'checkForInProgressPages'
const DEFAULT_INTERVAL = 30
const MIN_INTERVAL = 0.5 // Chrome minimum is 30 seconds

async function syncInProgressPagesAlarm({ forceRecreate = false } = {}) {
  const res = await chrome.storage.sync.get(['notificationsEnabled', 'notificationsInterval'])

  const notificationsEnabled = res.notificationsEnabled ?? false
  const notificationsInterval = Number(res.notificationsInterval ?? DEFAULT_INTERVAL)

  if (!notificationsEnabled) {
    await chrome.alarms.clear(ALARM_NAME)
    return
  }

  if (!forceRecreate) {
    const existingAlarm = await chrome.alarms.get(ALARM_NAME)
    if (existingAlarm) return // Already scheduled, don't reset it
  }

  await chrome.alarms.clear(ALARM_NAME)
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: MIN_INTERVAL,
    periodInMinutes: Math.max(notificationsInterval, MIN_INTERVAL),
  })
}

// On service worker restart: only create if missing
syncInProgressPagesAlarm()

// On settings change: force recreate with new interval
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') return
  if (changes.notificationsEnabled || changes.notificationsInterval) {
    syncInProgressPagesAlarm({ forceRecreate: true })
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    if (!res.notificationsEnabled) return
    const res = await chrome.storage.sync.get(['inProgressPages', 'notificationsEnabled'])

    const inProgressPages = res.inProgressPages ?? []
    const inProgressPagesNum = inProgressPages.length

    if (inProgressPagesNum > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('images/icon.png'),
        title: 'You have in progress pages',
        message: `There ${inProgressPagesNum === 1 ? 'is' : 'are'} ${inProgressPagesNum} ${
          inProgressPagesNum === 1 ? 'page' : 'pages'
        } marked as in progress.`,
        requireInteraction: true,
      })
    }
  }
})

chrome.runtime.onInstalled.addListener(() => {
  // CHECK maybe null the storage here?
  chrome.contextMenus.create({
    id: 'reddit-google-search',
    title: 'Reddit user: Google search',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.reddit.com/*', 'https://old.reddit.com/*'],
  })
  chrome.contextMenus.create({
    id: 'reddit-archived-posts',
    title: 'Reddit user: archived posts',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.reddit.com/*', 'https://old.reddit.com/*'],
  })
  chrome.contextMenus.create({
    id: 'reddit-archived-comments',
    title: 'Reddit user: archived comments',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.reddit.com/*', 'https://old.reddit.com/*'],
  })

  chrome.contextMenus.create({
    id: 'toggle-video-only',
    title: 'Toggle video only',
    contexts: ['video', 'page', 'selection'],
    documentUrlPatterns: ['https://chaturbate.com/*'],
  })

  chrome.contextMenus.create({
    title: 'TTS',
    id: 'tts',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText?.trim()

  const cleanUsername = selectedText
    ?.replace(/^u\//i, '')
    .replace(/^\/u\//i, '')
    .replace(/^@/, '')
    .trim()

  switch (info.menuItemId) {
    case 'reddit-google-search':
      if (!cleanUsername) return

      chrome.tabs.create({
        url: `https://www.google.com/search?q=` + encodeURIComponent(`"${cleanUsername}" site:reddit.com`),
      })
      break

    case 'reddit-archived-posts':
      if (!cleanUsername) return

      chrome.tabs.create({
        url: `https://search.pullpush.io/?author=${encodeURIComponent(cleanUsername)}&type=submission&sort_type=created_utc&sort=desc`,
      })
      break

    case 'reddit-archived-comments':
      if (!cleanUsername) return

      chrome.tabs.create({
        url: `https://search.pullpush.io/?kind=comment&author=` + encodeURIComponent(cleanUsername),
      })
      break

    case 'toggle-video-only':
      if (!tab?.id) return

      chrome.tabs.sendMessage(tab.id, {
        action: 'toggle-video-only',
      })
      break

    case 'tts':
      if (!selectedText) return

      chrome.tts.speak(selectedText, {
        lang: 'en-US',
        rate: 2.0,
      })
      break
  }
})
