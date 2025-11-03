let currentContacts = []
let filteredContacts = []

// Declare UI and API variables
const UI = {
  showLoading: (element) => {
    element.innerHTML = "<div>Loading...</div>"
  },
  showToast: (message) => {
    console.log(message)
  },
  formatCurrency: (amount) => {
    return `$${amount.toFixed(2)}`
  },
  formatDate: (date) => {
    return new Date(date).toLocaleDateString()
  },
  getInitials: (name) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
  },
}

const API = {
  getContacts: async () => {
    // Mock API call
    return [
      { contactId: 1, name: "John Doe", balance: 100, lastTxAt: "2023-01-01" },
      { contactId: 2, name: "Jane Smith", balance: -50, lastTxAt: "2023-01-02" },
      { contactId: 3, name: "Alice Johnson", balance: 0, lastTxAt: "2023-01-03" },
    ]
  },
}

const Storage = {
  setCachedContacts: (contacts) => {
    localStorage.setItem("contacts", JSON.stringify(contacts))
  },
  getCachedContacts: () => {
    return JSON.parse(localStorage.getItem("contacts")) || []
  },
}

document.addEventListener("DOMContentLoaded", () => {
  initPageListeners()
  loadContacts()
})

function initPageListeners() {
  document.getElementById("searchInput").addEventListener("input", handleSearch)
  document.getElementById("sortSelect").addEventListener("change", handleSort)
  document.getElementById("filterSelect").addEventListener("change", handleFilter)
  document.getElementById("fabBtn").addEventListener("click", toggleFABMenu)
  document.getElementById("profileBtn").addEventListener("click", toggleProfileDropdown)

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const page = e.currentTarget.dataset.page
      if (page !== "contacts") {
        window.location.href = page === "transactions" ? "index.html" : `${page}.html`
      }
    })
  })

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".fab") && !e.target.closest(".fab-menu")) {
      document.getElementById("fabMenu").style.display = "none"
    }
    if (!e.target.closest(".profile-btn") && !e.target.closest(".dropdown-menu")) {
      document.getElementById("profileDropdown").style.display = "none"
    }
  })
}

async function loadContacts() {
  const contactsList = document.getElementById("contactsList")
  UI.showLoading(contactsList)

  try {
    currentContacts = await API.getContacts()
    filteredContacts = [...currentContacts]
    updateSummary()
    renderContacts()
    Storage.setCachedContacts(currentContacts)
  } catch (error) {
    UI.showToast("Failed to load contacts")
    currentContacts = Storage.getCachedContacts()
    renderContacts()
  }
}

function updateSummary() {
  let give = 0,
    take = 0

  currentContacts.forEach((c) => {
    if (c.balance > 0) take += c.balance
    else if (c.balance < 0) give += Math.abs(c.balance)
  })

  document.querySelector(".summary-amount.give").textContent = UI.formatCurrency(give)
  document.querySelector(".summary-amount.take").textContent = UI.formatCurrency(take)
}

function renderContacts() {
  const contactsList = document.getElementById("contactsList")
  contactsList.innerHTML = ""

  if (filteredContacts.length === 0) {
    contactsList.innerHTML =
      '<p style="text-align: center; padding: 2rem; color: var(--neutral-text-light);">No contacts found</p>'
    return
  }

  filteredContacts.forEach((contact) => {
    const row = document.createElement("div")
    row.className = "contact-row"
    row.onclick = () => (window.location.href = `contact.html?id=${contact.contactId}`)

    const initials = UI.getInitials(contact.name)
    const statusClass = contact.balance > 0 ? "take" : contact.balance < 0 ? "give" : "settled"
    const statusLabel = contact.balance > 0 ? "Will get" : contact.balance < 0 ? "Will give" : "Settled"

    row.innerHTML = `
            <div class="avatar avatar-small">${initials}</div>
            <div class="contact-info">
                <div class="contact-info-top">
                    <span class="contact-name">${contact.name}</span>
                    <span class="contact-amount ${statusClass}">${UI.formatCurrency(Math.abs(contact.balance))}</span>
                </div>
                <div class="contact-info-bottom">
                    <span class="contact-updated">${UI.formatDate(contact.lastTxAt)}</span>
                    <span class="amount-label">${statusLabel}</span>
                </div>
            </div>
        `

    contactsList.appendChild(row)
  })
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase()
  filteredContacts = currentContacts.filter(
    (c) => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)),
  )
  renderContacts()
}

function handleSort(e) {
  const sort = e.target.value

  switch (sort) {
    case "recent":
      filteredContacts.sort((a, b) => new Date(b.lastTxAt) - new Date(a.lastTxAt))
      break
    case "oldest":
      filteredContacts.sort((a, b) => new Date(a.lastTxAt) - new Date(b.lastTxAt))
      break
    case "amount-high":
      filteredContacts.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      break
    case "amount-low":
      filteredContacts.sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance))
      break
    case "name":
      filteredContacts.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  renderContacts()
}

function handleFilter(e) {
  const filter = e.target.value
  filteredContacts = currentContacts.filter((c) => {
    switch (filter) {
      case "get":
        return c.balance > 0
      case "give":
        return c.balance < 0
      case "settled":
        return c.balance === 0
      default:
        return true
    }
  })
  renderContacts()
}

function toggleFABMenu(e) {
  e.stopPropagation()
  const menu = document.getElementById("fabMenu")
  menu.style.display = menu.style.display === "none" ? "flex" : "none"
}

function toggleProfileDropdown(e) {
  e.stopPropagation()
  const menu = document.getElementById("profileDropdown")
  menu.style.display = menu.style.display === "none" ? "block" : "none"
}
