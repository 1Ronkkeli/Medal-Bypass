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
})

// Medal Downloader Functionality
const ERROR_MESSAGE = `Please enter a valid Medal clip URL/ID.
Make sure you have copied the URL/ID correctly and the clip is not private.
OR
Wait a couple of seconds and try again.`
const LOADING_MESSAGE = `Bypassing Watermark`
const COOLDOWN_START = 3
let loadingInterval = null
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
  if (!url || !checkURL(url)) return alert("Please enter a valid Medal clip URL/ID.")
  const id = extractClipID(url)
  if (!id) return alert("Please enter a valid Medal clip URL/ID.")
  if (isClipAlreadyDownloaded(id)) {
    return alert("You already downloaded this clip!")
  }
  if (cooldown > 0) {
    return alert("Please wait " + cooldown + " seconds.")
  }
  cooldown = COOLDOWN_START
  updateButtonState(cooldown)
  addClipToHistory(id)
  startLoading()
  try {
    const video = await fetchVideoWithoutWatermark(url)
    if (!video?.valid) {
      stopLoading(false, id)
      return alert(ERROR_MESSAGE)
    }
    stopLoading(video?.valid, id)
    displayVideoWithDownloadLink(video.src, id)
  } catch {
    stopLoading(false, id)
    return alert(ERROR_MESSAGE)
  }
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
  containerElement.classList.add("video")
  aElement.download = "MedalTV_" + id + ".mp4"
  aElement.innerHTML = '<i class="fa-solid fa-download"></i> Download Video'
  aElement.href = src
  videoElement.src = src
  videoElement.controls = true
  containerElement.appendChild(videoElement)
  containerElement.appendChild(aElement)
  videosContainer.prepend(containerElement)
  document.body.dataset["clipsShown"] = "true"
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
  button.innerHTML = `<i class="fa-solid fa-clock"></i> Wait ${cooldown} seconds!`
}
function addClipToHistory(id) {
  lastURLs.push({ id, active: true })
}
function startLoading() {
  if (loadingInterval) clearInterval(loadingInterval)
  loading.style.display = "block"
  helpLink.style.display = "none"
  loading.innerText = LOADING_MESSAGE
  let numOfDots = 0
  loadingInterval = setInterval(() => {
    numOfDots += 1
    if (numOfDots >= 4) numOfDots = 0
    loading.innerText = LOADING_MESSAGE + ".".repeat(numOfDots)
  }, 500)
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
  loading.style.display = "none"
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
    if (button.innerHTML.includes("Download Another")) {
      button.innerHTML = `<i class="fa-solid fa-download"></i> Download Another Clip`
    } else {
      button.innerHTML = `<i class="fa-solid fa-download"></i> Download`
    }
  }
}, 1000)

