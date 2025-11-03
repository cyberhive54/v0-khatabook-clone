class Storage {
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  static get(key) {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }

  static remove(key) {
    localStorage.removeItem(key)
  }

  static hasUnsavedChanges() {
    return this.get("unsavedChanges") === true
  }

  static setUnsavedChanges(value) {
    if (value) {
      this.set("unsavedChanges", true)
    } else {
      this.remove("unsavedChanges")
    }
  }

  static getCachedContact(id) {
    return this.get(`contact_${id}`)
  }

  static setCachedContact(id, data) {
    this.set(`contact_${id}`, data)
  }

  static getCachedContacts() {
    return this.get("contacts") || []
  }

  static setCachedContacts(contacts) {
    this.set("contacts", contacts)
  }
}
