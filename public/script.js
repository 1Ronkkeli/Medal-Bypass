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
  const url = configureURL(inputtedURL)
  if (!url || !checkURL(url)) return showNotification("Please enter a valid Medal clip URL/ID.", "error")
  const id = extractClipID(url)
  if (!id) return showNotification("Please enter a valid Medal clip URL/ID.", "error")
  if (isClipAlreadyDownloaded(id)) {
    return showNotification("You already downloaded this clip!", "error")
  }
  if (cooldown > 0) {
    return showNotification(`Please wait ${cooldown} seconds.`, "error")
  }
  cooldown = COOLDOWN_START
  updateButtonState(cooldown)
  addClipToHistory(id)
  startLoading()
  try {
    const video = await fetchVideoWithoutWatermark(url)
    if (!video?.valid) {
      stopLoading(false, id)
      return showNotification(ERROR_MESSAGE, "error")
    }
    stopLoading(video?.valid, id)
    displayVideoWithDownloadLink(video.src, id)
    showNotification("Video downloaded successfully!", "success")
  } catch {
    stopLoading(false, id)
    return showNotification(ERROR_MESSAGE, "error")
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
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 450px;
        animation: slideInRight 0.3s ease, fadeOut 0.5s ease 4.5s forwards;
        cursor: pointer;
      }
      .notification.success {
        background-color: #4caf50;
      }
      .notification.error {
        background-color: #f44336;
      }
      .notification.info {
        background-color: #2196f3;
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
    default:
      icon = "fa-info-circle"
  }

  notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`

  // Add to container
  notificationContainer.appendChild(notification)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.remove()
  }, 5000)

  // Click to dismiss
  notification.addEventListener("click", () => {
    notification.remove()
  })
}

async function fetchVideoWithoutWatermark(url) {
  const data = { url }
  const fetchData = await fetch("https://medal-dl.rxx.fi/api/clip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch((e) => e)
  return fetchData?.json()
}
function configureURL(url) {
  if (!url) return false
  if (!url.toLowerCase().includes("medal")) {
    if (!url.includes("/")) url = "https://medal.tv/?contentId=" + url.trim()
    else return false
  }
  if (url.toLowerCase().indexOf("https://") !== url.toLowerCase().lastIndexOf("https://")) {
    return false
  }
  if (!url.toLowerCase().includes("https://")) {
    url = "https://" + url
  }
  url = url.replace("?theater=true", "")
  return url.trim()
}
function checkURL(url) {
  try {
    if (!url) return false
    if (!new URL(url).hostname.toLowerCase().includes("medal")) {
      return false
    }
  } catch {
    return false
  }
  return true
}
function displayVideoWithDownloadLink(src, id) {
  const containerElement = document.createElement("div")
  const videoElement = document.createElement("video")
  const aElement = document.createElement("a")

  containerElement.classList.add("video", "animate__animated", "animate__fadeIn")

  aElement.download = "MedalTV_" + id + ".mp4"
  aElement.innerHTML = '<i class="fa-solid fa-download"></i> Download Video'
  aElement.href = src
  aElement.className = "download-button"

  videoElement.src = src
  videoElement.controls = true
  videoElement.className = "video-player"

  containerElement.appendChild(videoElement)
  containerElement.appendChild(aElement)
  videosContainer.prepend(containerElement)
  document.body.dataset["clipsShown"] = "true"

  // Scroll to the video with smooth animation
  setTimeout(() => {
    containerElement.scrollIntoView({ behavior: "smooth", block: "center" })
  }, 300)
}
function extractClipID(url) {
  const clipIdMatch = url.match(/\/clips\/([^/?&]+)/)
  const contentIdMatch = url.match(/[?&]contentId=([^&]+)/)
  if (clipIdMatch) return clipIdMatch[1]
  if (contentIdMatch) return contentIdMatch[1]
  return false
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

