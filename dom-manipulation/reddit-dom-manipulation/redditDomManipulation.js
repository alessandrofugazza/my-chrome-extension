function updateHiddenProfileText() {
  const emptyFeedText = document.querySelector('#empty-feed-content .text-body-1')

  if (!emptyFeedText) return

  const originalText = emptyFeedText.textContent.trim()

  const match = originalText.match(
    /^(u\/[^\s]+)\s+likes to keep their posts hidden, but check out their stats to learn more about them./,
  )

  if (!match) return

  const username = match[1]
  const cleanUsername = username.replace('u/', '')

  const redditSearchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(`"${cleanUsername}" site:reddit.com`)

  emptyFeedText.innerHTML = `${username} can suck a dick, but you can<br><a
  href="${redditSearchUrl}"
  target="_blank"
  style="color:#4f8cff;"
>search this fucker on Google</a>.`
}

updateHiddenProfileText()

new MutationObserver(updateHiddenProfileText).observe(document.body, {
  childList: true,
  subtree: true,
})
