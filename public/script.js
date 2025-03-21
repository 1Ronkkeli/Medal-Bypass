// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById("theme-switch")

  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    document.body.className = savedTheme
    themeSwitch.checked = savedTheme === "dark"
  } else {
    // Use device preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.body.className = prefersDark ? "dark" : "light"
    themeSwitch.checked = prefersDark
  }

  // Theme switch event listener
  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      document.body.className = "dark"
      localStorage.setItem("theme", "dark")
    } else {
      document.body.className = "light"
      localStorage.setItem("theme", "light")
    }
  })

  // Add animation classes when scrolling
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".card, .video")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (elementPosition < screenPosition) {
        if (!element.classList.contains("animate__animated")) {
          element.classList.add("animate__animated", "animate__fadeInUp")
        }
      }
    })
  }

  window.addEventListener("scroll", animateOnScroll)
  animateOnScroll() // Run once on load
})

// Medal Downloader Functionality
const ERROR_MESSAGE = `Please enter a valid Medal clip URL/ID.
Make sure you have copied the URL/ID correctly and the clip is not private.
OR
Wait a couple of seconds and try again.`
const LOADING_MESSAGE = `Bypassing Watermark`
const COOLDOWN_START = 3
const loadingInterval = null
const lastURLs = []
let cooldown = 0
const videosContainer = document.querySelector("#videos")
const loading = document.querySelector("#loading")
const helpLink = document.querySelector(".help-link")
const button = document.querySelector("#download-btn")
button.addEventListener("click", () => downloadVideo())
const params = new URLSearchParams(document.location.search)
if (params.get("url")?.length) {
  downloadVideo(params.get("url"))
} else if (params.get("id")?.length) {
  downloadVideo(params.get("id"))
}

async function downloadVideo(initialURL) {
  const inputtedURL = initialURL ?? document.querySelector("input").value
  if (!inputtedURL.trim()) {
    return showNotification("Please enter a Medal clip URL or ID", "error")
  }

  const url = configureURL(inputtedURL)
  if (!url) {
    return showNotification("Please enter a valid Medal clip URL/ID.", "error")
  }

  const id = extractClipID(url)
  if (!id) {
    return showNotification("Could not extract clip ID from the URL. Please check the format.", "error")
  }

  if (isClipAlreadyDownloaded(id)) {
    return showNotification("You already downloaded this clip!", "warning")
  }

  if (cooldown > 0) {
    return showNotification(`Please wait ${cooldown} seconds before trying again.`, "warning")
  }

  cooldown = COOLDOWN_START
  updateButtonState(cooldown)
  addClipToHistory(id)
  startLoading()

  try {
    const video = await fetchVideoWithoutWatermark(url)
    if (!video?.valid) {
      stopLoading(false, id)
      return showNotification("Could not retrieve the video. The clip may be private or no longer available.", "error")
    }
    stopLoading(video?.valid, id)
    displayVideoWithDownloadLink(video.src, id)
    showNotification("Video downloaded successfully!", "success")
  } catch (error) {
    console.error("Error fetching video:", error)
    stopLoading(false, id)
    return showNotification("An error occurred while processing your request. Please try again later.", "error")
  }
}

// Show notification function
function showNotification(message, type = "info") {
  // Check if notification container exists, if not create it
  let notificationContainer = document.querySelector(".notification-container")
  if (!notificationContainer) {
    notificationContainer = document.createElement("div")
    notificationContainer.className = "notification-container"
    document.body.appendChild(notificationContainer)

    // Add styles for notification container
    const style = document.createElement("style")
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .notification {
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .notification.success {
        background-color: #4caf50;
      }
      .notification.error {
        background-color: #2c2c2c;
        border-left: 4px solid #f44336;
      }
      .notification.warning {
        background-color: #2c2c2c;
        border-left: 4px solid #ff9800;
      }
      .notification.info {
        background-color: #2c2c2c;
        border-left: 4px solid #2196f3;
      }
      .notification::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        animation: countdown 5s linear forwards;
      }
      @keyframes countdown {
        from { width: 100%; }
        to { width: 0%; }
      }
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `
    document.head.appendChild(style)
  }

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  // Add icon based on type
  let icon
  switch (type) {
    case "success":
      icon = "fa-check-circle"
      break
    case "error":
      icon = "fa-exclamation-circle"
      break
    case "warning":
      icon = "fa-exclamation-triangle"
      break
    default:
      icon = "fa-info-circle"
  }

  notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`

  // Add to container
  notificationContainer.appendChild(notification)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.5s ease forwards"
    setTimeout(() => {
      notification.remove()
    }, 500)
  }, 5000)

  // Click to dismiss
  notification.addEventListener("click", () => {
    notification.style.animation = "fadeOut 0.3s ease forwards"
    setTimeout(() => {
      notification.remove()
    }, 300)
  })
}

async function fetchVideoWithoutWatermark(url) {
  const data = { url }
  try {
    const fetchData = await fetch("https://medal-dl.rxx.fi/api/clip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!fetchData.ok) {
      console.error("Server responded with status:", fetchData.status)
      return { valid: false }
    }

    return await fetchData.json()
  } catch (error) {
    console.error("Error fetching video:", error)
    return { valid: false }
  }
}

function configureURL(url) {
  if (!url) return false

  // Clean up the URL
  url = url.trim()

  // Handle direct clip IDs
  if (!url.includes("/") && !url.includes("medal")) {
    return "https://medal.tv/?contentId=" + url
  }

  // Handle URLs without https://
  if (!url.toLowerCase().startsWith("http")) {
    url = "https://" + url
  }

  // Validate the URL
  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.toLowerCase().includes("medal")) {
      return false
    }

    // Remove theater mode if present
    url = url.replace("?theater=true", "")

    // Handle URLs with query parameters
    if (url.includes("?")) {
      // Keep only the base URL and contentId if present
      const urlObj = new URL(url)
      const contentId = urlObj.searchParams.get("contentId")
      if (contentId) {
        return `https://medal.tv/?contentId=${contentId}`
      }

      // For other URLs, keep the path but remove query params that might cause issues
      const basePath = urlObj.origin + urlObj.pathname
      return basePath
    }

    return url
  } catch (e) {
    console.error("Error parsing URL:", e)
    return false
  }
}

function checkURL(url) {
  try {
    if (!url) return false
    const urlObj = new URL(url)
    return urlObj.hostname.toLowerCase().includes("medal")
  } catch {
    return false
  }
}

function extractClipID(url) {
  try {
    // Try to extract clip ID from URL path
    const clipIdMatch = url.match(/\/clips\/([^/?&]+)/)
    if (clipIdMatch) return clipIdMatch[1]

    // Try to extract contentId from query params
    const urlObj = new URL(url)
    const contentId = urlObj.searchParams.get("contentId")
    if (contentId) return contentId

    // Try to extract from invite parameter
    const invite = urlObj.searchParams.get("invite")
    if (invite) {
      const parts = invite.split("-")
      if (parts.length > 0) {
        return parts[parts.length - 1]
      }
    }

    return false
  } catch (e) {
    console.error("Error extracting clip ID:", e)
    return false
  }
}

function isClipAlreadyDownloaded(id) {
  return lastURLs.some((u) => id === u.id)
}

function removeClipFromHistory(id) {
  const index = lastURLs.findIndex((u) => u.id === id)
  if (index !== -1) {
    lastURLs.splice(index, 1)
  }
}

function updateClipFromHistory(id) {
  const index = lastURLs.findIndex((u) => u.id === id)
  if (index !== -1) {
    lastURLs[index].active = false
  }
}

function updateButtonState(cooldown) {
  button.disabled = true
  button.style.cursor = "not-allowed"
  button.classList.remove("pulse-animation")
  button.innerHTML = `<i class="fa-solid fa-clock"></i> Wait ${cooldown} seconds!`
}

function addClipToHistory(id) {
  lastURLs.push({ id, active: true })
}

function startLoading() {
  if (loadingInterval) clearInterval(loadingInterval)
  loading.style.display = "block"
  loading.classList.add("active")
  helpLink.style.display = "none"
  loading.innerText = LOADING_MESSAGE
}

function stopLoading(successful = true, id = "") {
  if (id) {
    if (successful) updateClipFromHistory(id)
    else removeClipFromHistory(id)
  }
  if (lastURLs.some((u) => u.active)) return
  if (loadingInterval) clearInterval(loadingInterval)
  if (!successful) {
    helpLink.style.display = "inline-flex"
  }
  loading.classList.remove("active")
  setTimeout(() => {
    loading.style.display = "none"
  }, 300)
}

// Cooldown
setInterval(() => {
  if (cooldown > 0) {
    button.disabled = true
    button.style.cursor = "not-allowed"
    button.innerHTML = `<i class="fa-solid fa-clock"></i> Wait ${cooldown} seconds!`
    cooldown--
  } else {
    button.disabled = false
    button.style.cursor = "pointer"
    button.classList.add("pulse-animation")
    if (button.innerHTML.includes("Download Another")) {
      button.innerHTML = `<i class="fa-solid fa-download"></i> Download Another Clip`
    } else {
      button.innerHTML = `<i class="fa-solid fa-download"></i> Download`
    }
  }
}, 1000)

function displayVideoWithDownloadLink(videoSrc, clipId) {
  const videoContainerId = `video-container-${clipId}`
  let videoContainer = document.getElementById(videoContainerId)

  if (!videoContainer) {
    videoContainer = document.createElement("div")
    videoContainer.id = videoContainerId
    videoContainer.className = "video-container"
    videosContainer.prepend(videoContainer)
  } else {
    videoContainer.innerHTML = "" // Clear existing content
  }

  const video = document.createElement("video")
  video.src = videoSrc
  video.controls = true
  video.muted = true
  video.loop = true
  video.autoplay = true
  video.className = "medal-video"

  const downloadLink = document.createElement("a")
  downloadLink.href = videoSrc
  downloadLink.download = `medal_clip_${clipId}.mp4`
  downloadLink.textContent = "Download Video"
  downloadLink.className = "download-link"

  videoContainer.appendChild(video)
  videoContainer.appendChild(downloadLink)
}

