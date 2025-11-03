const params = new URLSearchParams(window.location.search)
const contactId = params.get("cid")
const transactionId = params.get("tx")
const mode = params.get("mode") || "new"
const type = params.get("type") || "GIVE"

let selectedImages = []
let isEditing = false

const API = {} // Declare API variable
const UI = {} // Declare UI variable
const Storage = {} // Declare Storage variable

document.addEventListener("DOMContentLoaded", () => {
  initForm()
  initListeners()

  if (transactionId) {
    loadTransaction()
    document.getElementById("typeSelectGroup").style.display = "none"
    document.getElementById("contactSelectGroup").style.display = "none"
  } else if (contactId) {
    document.getElementById("contactSelectGroup").style.display = "none"
    document.querySelector(`input[name="type"][value="${type}"]`).checked = true
  } else {
    loadContacts()
    document.getElementById("typeSelectGroup").style.display = "block"
  }
})

function initForm() {
  const now = new Date()
  document.getElementById("dateInput").valueAsDate = now
  document.getElementById("timeInput").value = now.toTimeString().slice(0, 5)
}

function initListeners() {
  document.getElementById("backBtn").addEventListener("click", checkUnsavedChanges)
  document.getElementById("uploadBtn").addEventListener("click", () => {
    document.getElementById("fileInput").click()
  })
  document.getElementById("fileInput").addEventListener("change", handleFileSelect)
  document.getElementById("notesInput").addEventListener("input", updateCharCount)
  document.getElementById("saveBtn").addEventListener("click", saveTransaction)

  // Track changes for unsaved guard
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("change", () => Storage.setUnsavedChanges(true))
  })
}

async function loadContacts() {
  try {
    const contacts = await API.getContacts()
    const select = document.getElementById("contactSelect")
    select.innerHTML = '<option value="">Select a contact</option>'
    contacts.forEach((c) => {
      const option = document.createElement("option")
      option.value = c.contactId
      option.textContent = c.name
      select.appendChild(option)
    })
  } catch (error) {
    UI.showToast("Failed to load contacts")
  }
}

async function loadTransaction() {
  try {
    const tx = await API.getTransaction(transactionId)
    isEditing = true

    document.getElementById("amountInput").value = tx.amount
    document.getElementById("dateInput").valueAsDate = new Date(tx.datetime)
    document.getElementById("timeInput").value = new Date(tx.datetime).toTimeString().slice(0, 5)
    document.getElementById("notesInput").value = tx.notes || ""

    const label = tx.type === "GIVE" ? "to" : "from"
    const contact = await API.getContact(tx.contactId)
    document.getElementById("txTitle").textContent =
      `You ${tx.type === "GIVE" ? "gave" : "got"} ₹${tx.amount} ${label} ${contact.name}`

    if (tx.imageUrls && tx.imageUrls.length > 0) {
      selectedImages = tx.imageUrls
      renderImagePreviews()
    }

    updateCharCount()
  } catch (error) {
    UI.showToast("Failed to load transaction")
  }
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      UI.showToast("Image too large (max 5MB)")
      return
    }
    uploadImage(file)
  })
}

async function uploadImage(file) {
  try {
    document.getElementById("saveBtn").disabled = true
    const url = await API.uploadImage(file)
    selectedImages.push(url)
    renderImagePreviews()
  } catch (error) {
    UI.showToast("Failed to upload image")
  } finally {
    document.getElementById("saveBtn").disabled = false
  }
}

function renderImagePreviews() {
  const container = document.getElementById("imagePreviews")
  container.innerHTML = ""

  selectedImages.forEach((url, index) => {
    const preview = document.createElement("div")
    preview.className = "image-preview"
    preview.innerHTML = `
            <img src="${url}" alt="Preview">
            <button type="button" class="image-remove" onclick="removeImage(${index})">×</button>
        `
    container.appendChild(preview)
  })
}

function removeImage(index) {
  selectedImages.splice(index, 1)
  renderImagePreviews()
  Storage.setUnsavedChanges(true)
}

function updateCharCount() {
  const count = document.getElementById("notesInput").value.length
  document.getElementById("charCount").textContent = count
}

async function saveTransaction() {
  const amount = Number.parseFloat(document.getElementById("amountInput").value)
  const date = document.getElementById("dateInput").value
  const time = document.getElementById("timeInput").value
  const notes = document.getElementById("notesInput").value

  if (!amount || amount <= 0) {
    UI.showToast("Please enter a valid amount")
    return
  }

  try {
    const datetime = new Date(`${date}T${time}`).toISOString()
    const txType = document.querySelector('input[name="type"]:checked').value
    const cId = contactId || document.getElementById("contactSelect").value

    if (!cId) {
      UI.showToast("Please select a contact")
      return
    }

    if (isEditing) {
      await API.editTransaction(transactionId, {
        amount,
        datetime,
        notes,
        imageUrls: selectedImages,
      })
    } else {
      await API.addTransaction(cId, datetime, txType, amount, notes, selectedImages)
    }

    Storage.setUnsavedChanges(false)
    UI.showToast("Transaction saved")
    setTimeout(() => {
      history.back()
    }, 500)
  } catch (error) {
    UI.showToast("Failed to save transaction")
  }
}

function checkUnsavedChanges() {
  if (Storage.hasUnsavedChanges()) {
    const modal = UI.showModal(
      "Unsaved Changes",
      "You have unsaved changes. What would you like to do?",
      `
            <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); history.back();">Discard</button>
            <button class="btn btn-primary" onclick="saveTransaction()">Save</button>
        `,
    )
  } else {
    history.back()
  }
}
