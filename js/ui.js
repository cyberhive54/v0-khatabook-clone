class UI {
  static showToast(message, duration = 3000) {
    const toast = document.createElement("div")
    toast.className = "toast"
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.animation = "toast-slide-up 0.3s ease reverse"
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  static showModal(title, content, actions) {
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">${title}</div>
                <div class="modal-body">${content}</div>
                <div class="modal-actions">${actions}</div>
            </div>
        `

    document.body.appendChild(modal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove()
    })

    return modal
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  static formatDate(date) {
    if (typeof date === "string") date = new Date(date)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return diffMins + "m ago"
      }
      return diffHours + "h ago"
    }
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return diffDays + "d ago"

    return date.toLocaleDateString("en-IN")
  }

  static getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  static showLoading(container) {
    container.innerHTML = `
            <div class="contact-row skeleton"></div>
            <div class="contact-row skeleton"></div>
            <div class="contact-row skeleton"></div>
        `
  }

  static toggleTheme() {
    const html = document.documentElement
    const theme = html.getAttribute("data-theme")
    const newTheme = theme === "dark" ? "light" : "dark"
    html.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  static initTheme() {
    const theme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", theme)
  }
}

// Initialize theme on page load
UI.initTheme()
