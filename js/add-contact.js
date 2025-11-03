let photoData = null
const params = new URLSearchParams(window.location.search)
const contactId = params.get("id")
let isEditing = false

const API = {
  getContact: async (id) => {
    // Mock implementation for demonstration
    return {
      name: "John Doe",
      phone: "1234567890",
      address: "123 Main St",
      notes: "Notes about John",
      photoUrl: "path/to/photo.jpg",
    }
  },
  editContact: async (id, data) => {
    // Mock implementation for demonstration
    console.log("Editing contact:", id, data)
  },
  addContact: async (name, phone, photoUrl, address, notes) => {
    // Mock implementation for demonstration
    console.log("Adding contact:", name, phone, photoUrl, address, notes)
  },
}

const UI = {
  showToast: (message) => {
    alert(message)
  },
}

document.addEventListener("DOMContentLoaded", () => {
  initListeners()

  if (contactId) {
    loadContact()
    isEditing = true
    document.getElementById("pageTitle").textContent = "Edit Contact"
  }
})

function initListeners() {
  document.getElementById("backBtn").addEventListener("click", () => history.back())
  document.getElementById("photoBtn").addEventListener("click", () => {
    document.getElementById("photoInput").click()
  })
  document.getElementById("photoInput").addEventListener("change", handlePhotoSelect)
  document.getElementById("cancelBtn").addEventListener("click", () => history.back())
  document.getElementById("saveBtn").addEventListener("click", saveContact)
}

function handlePhotoSelect(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      photoData = event.target.result
      document.getElementById("photoPreview").style.backgroundImage = `url(${photoData})`
      document.getElementById("photoPreview").textContent = ""
    }
    reader.readAsDataURL(file)
  }
}

async function loadContact() {
  try {
    const contact = await API.getContact(contactId)
    document.getElementById("nameInput").value = contact.name
    document.getElementById("phoneInput").value = contact.phone || ""
    document.getElementById("addressInput").value = contact.address || ""
    document.getElementById("notesInput").value = contact.notes || ""

    if (contact.photoUrl) {
      photoData = contact.photoUrl
      document.getElementById("photoPreview").style.backgroundImage = `url(${photoData})`
      document.getElementById("photoPreview").textContent = ""
    }
  } catch (error) {
    UI.showToast("Failed to load contact")
  }
}

async function saveContact() {
  const name = document.getElementById("nameInput").value.trim()
  const phone = document.getElementById("phoneInput").value.trim()
  const address = document.getElementById("addressInput").value.trim()
  const notes = document.getElementById("notesInput").value.trim()

  if (!name) {
    UI.showToast("Please enter contact name")
    return
  }

  try {
    if (isEditing) {
      await API.editContact(contactId, { name, phone, address, notes, photoUrl: photoData })
    } else {
      await API.addContact(name, phone, photoData, address, notes)
    }

    UI.showToast("Contact saved")
    setTimeout(() => {
      history.back()
    }, 500)
  } catch (error) {
    UI.showToast("Failed to save contact")
  }
}
