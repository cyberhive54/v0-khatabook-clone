const API_URL = "https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/userweb" // Replace with your deployment ID

class API {
  static async request(action, method = "GET", body = null) {
    try {
      const url = method === "GET" ? `${API_URL}?action=${action}` : API_URL

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (method === "POST" && body) {
        options.body = JSON.stringify({ action, ...body })
      }

      const response = await fetch(url, options)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "API request failed")
      }

      return data.data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  static getContacts(bookId = "default") {
    return this.request(`getContacts&bookId=${bookId}`)
  }

  static getContact(id) {
    return this.request(`getContact&id=${id}`)
  }

  static addContact(name, phone, photoUrl, address, notes, bookId = "default") {
    return this.request("addContact", "POST", {
      name,
      phone,
      photoUrl,
      address,
      notes,
      bookId,
    })
  }

  static editContact(id, updates) {
    return this.request(`editContact&id=${id}`, "POST", updates)
  }

  static deleteContact(id) {
    return this.request(`deleteContact&id=${id}`, "POST")
  }

  static getTransactions(contactId, bookId = "default", limit = 100, offset = 0) {
    return this.request(`getTransactions&contactId=${contactId}&bookId=${bookId}&limit=${limit}&offset=${offset}`)
  }

  static getTransaction(id) {
    return this.request(`getTransaction&id=${id}`)
  }

  static addTransaction(contactId, datetime, type, amount, notes, imageUrls = [], bookId = "default") {
    return this.request("addTransaction", "POST", {
      contactId,
      datetime,
      type,
      amount,
      notes,
      imageUrls,
      bookId,
    })
  }

  static editTransaction(id, updates) {
    return this.request(`editTransaction&id=${id}`, "POST", updates)
  }

  static deleteTransaction(id) {
    return this.request(`deleteTransaction&id=${id}`, "POST")
  }

  static uploadImage(file) {
    const formData = new FormData()
    formData.append("action", "uploadImage")
    formData.append("file", file)

    return fetch(API_URL, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.message)
        return d.data
      })
  }
}
