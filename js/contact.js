const params = new URLSearchParams(window.location.search)
const contactId = params.get("id")
let currentContact = null
let transactions = []

const API = {
  getContact: async (id) => {
    // Mock implementation for demonstration purposes
    return { name: "John Doe", phone: "123-456-7890", balance: 100 }
  },
  getTransactions: async (id) => {
    // Mock implementation for demonstration purposes
    return [
      { txId: 1, datetime: new Date(), notes: "Transaction 1", type: "GIVE", amount: 50 },
      { txId: 2, datetime: new Date(), notes: "Transaction 2", type: "GOT", amount: 30 },
    ]
  },
}

const UI = {
  getInitials: (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
  },
  formatCurrency: (amount) => {
    return `$${amount.toFixed(2)}`
  },
  showToast: (message) => {
    console.log(message)
  },
}

const Storage = {
  setCachedContact: (id, contact) => {
    localStorage.setItem(`contact-${id}`, JSON.stringify(contact))
  },
  getCachedContact: (id) => {
    return JSON.parse(localStorage.getItem(`contact-${id}`))
  },
}

document.addEventListener("DOMContentLoaded", () => {
  initListeners()
  loadContactData()
})

function initListeners() {
  document.getElementById("backBtn").addEventListener("click", () => history.back())
  document.getElementById("contactMenuBtn").addEventListener("click", toggleContactMenu)
  document.getElementById("gaveBtn").addEventListener("click", () => {
    window.location.href = `transaction.html?cid=${contactId}&mode=new&type=GIVE`
  })
  document.getElementById("gotBtn").addEventListener("click", () => {
    window.location.href = `transaction.html?cid=${contactId}&mode=new&type=GOT`
  })

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-btn") && !e.target.closest(".dropdown-menu")) {
      document.getElementById("contactMenu").style.display = "none"
    }
  })
}

async function loadContactData() {
  try {
    currentContact = await API.getContact(contactId)
    transactions = await API.getTransactions(contactId)

    renderContactHeader()
    renderSummary()
    renderTransactions()

    Storage.setCachedContact(contactId, currentContact)
  } catch (error) {
    UI.showToast("Failed to load contact")
    currentContact = Storage.getCachedContact(contactId)
    if (currentContact) {
      renderContactHeader()
      renderSummary()
    }
  }
}

function renderContactHeader() {
  const initials = UI.getInitials(currentContact.name)
  document.getElementById("contactAvatar").textContent = initials
  document.getElementById("contactName").textContent = currentContact.name
  document.getElementById("contactPhone").textContent = currentContact.phone || "No phone"
}

function renderSummary() {
  const status =
    currentContact.balance > 0 ? "You will get" : currentContact.balance < 0 ? "You will give" : "Settled up"
  const statusClass = currentContact.balance > 0 ? "take" : "give"

  document.getElementById("statusText").textContent = status
  document.getElementById("statusAmount").textContent = UI.formatCurrency(Math.abs(currentContact.balance))
  document.getElementById("statusAmount").className = "status-amount " + statusClass
}

function renderTransactions() {
  const transactionList = document.getElementById("transactionList")
  const gaveList = document.getElementById("gaveList")
  const gotList = document.getElementById("gotList")

  transactionList.innerHTML = ""
  gaveList.innerHTML = ""
  gotList.innerHTML = ""

  let runningBalance = 0
  ;[...transactions].reverse().forEach((tx) => {
    // Timeline
    const item = document.createElement("div")
    item.className = "transaction-item"
    item.onclick = () => (window.location.href = `transaction.html?cid=${contactId}&tx=${tx.txId}`)

    const date = new Date(tx.datetime)
    item.innerHTML = `
            <div class="transaction-time">${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            <div class="transaction-note">${tx.notes || "No note"}</div>
        `
    transactionList.appendChild(item)

    // Amounts
    const amountItem = document.createElement("div")
    amountItem.className = `amount-item ${tx.type === "GIVE" ? "give" : "got"}`
    amountItem.textContent = UI.formatCurrency(tx.amount)

    if (tx.type === "GIVE") {
      gaveList.appendChild(amountItem)
      runningBalance -= tx.amount
    } else {
      gotList.appendChild(amountItem)
      runningBalance += tx.amount
    }
  })
}

function toggleContactMenu(e) {
  e.stopPropagation()
  const menu = document.getElementById("contactMenu")
  menu.style.display = menu.style.display === "none" ? "block" : "none"
}
