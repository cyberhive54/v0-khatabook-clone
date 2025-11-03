document.addEventListener("DOMContentLoaded", () => {
  initListeners()
  loadSettings()
})

function initListeners() {
  document.getElementById("backBtn").addEventListener("click", () => history.back())
  document.getElementById("themeSelect").addEventListener("change", handleThemeChange)
  document.getElementById("exportBtn").addEventListener("click", exportData)
  document.getElementById("recycleBinBtn").addEventListener("click", () => {
    window.location.href = "recycle-bin.html"
  })
  document.getElementById("logoutBtn").addEventListener("click", logout)

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const page = e.currentTarget.dataset.page
      if (page !== "settings") {
        window.location.href = page === "contacts" ? "index.html" : "transaction.html"
      }
    })
  })
}

function loadSettings() {
  const theme = localStorage.getItem("theme") || "light"
  document.getElementById("themeSelect").value = theme
}

function handleThemeChange(e) {
  const theme = e.target.value
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)
}

async function exportData() {
  try {
    const contacts = await window.API.getContacts()
    let csv = "Name,Phone,Amount\n"

    contacts.forEach((c) => {
      csv += `"${c.name}","${c.phone || ""}","${c.balance}"\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    window.UI.showToast("Exported successfully")
  } catch (error) {
    window.UI.showToast("Failed to export data")
  }
}

function logout() {
  localStorage.clear()
  window.location.href = "/"
}
