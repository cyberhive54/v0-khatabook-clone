const SHEET_ID = 'YOUR_SHEET_ID'; // Replace with your Google Sheet ID
const FOLDER_ID = 'YOUR_FOLDER_ID'; // Replace with your Drive folder ID

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getContacts':
        return handleGetContacts(e);
      case 'getContact':
        return handleGetContact(e);
      case 'getTransactions':
        return handleGetTransactions(e);
      case 'getTransaction':
        return handleGetTransaction(e);
      default:
        return success(null, 'Unknown action');
    }
  } catch(error) {
    return error_response(error.message);
  }
}

function doPost(e) {
  const action = JSON.parse(e.postData.contents).action;
  
  try {
    switch(action) {
      case 'addContact':
        return handleAddContact(e);
      case 'editContact':
        return handleEditContact(e);
      case 'deleteContact':
        return handleDeleteContact(e);
      case 'addTransaction':
        return handleAddTransaction(e);
      case 'editTransaction':
        return handleEditTransaction(e);
      case 'deleteTransaction':
        return handleDeleteTransaction(e);
      case 'uploadImage':
        return handleUploadImage(e);
      default:
        return success(null, 'Unknown action');
    }
  } catch(error) {
    return error_response(error.message);
  }
}

// Response helpers
function success(data, message = 'Success') {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

function error_response(message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    data: null,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// Get contacts
function handleGetContacts(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contacts');
  const data = sheet.getDataRange().getValues();
  
  const contacts = [];
  for(let i = 1; i < data.length; i++) {
    const row = data[i];
    contacts.push({
      contactId: row[0],
      name: row[1],
      phone: row[2],
      photoUrl: row[3],
      address: row[4],
      notes: row[5],
      createdAt: row[6],
      updatedAt: row[7],
      balance: calculateBalance(row[0]),
      txCount: getTransactionCount(row[0]),
      lastTxAt: getLastTransactionDate(row[0])
    });
  }
  
  return success(contacts);
}

// Get single contact
function handleGetContact(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contacts');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      const row = data[i];
      return success({
        contactId: row[0],
        name: row[1],
        phone: row[2],
        photoUrl: row[3],
        address: row[4],
        notes: row[5],
        createdAt: row[6],
        updatedAt: row[7],
        balance: calculateBalance(id),
        txCount: getTransactionCount(id),
        lastTxAt: getLastTransactionDate(id)
      });
    }
  }
  
  return error_response('Contact not found');
}

// Add contact
function handleAddContact(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contacts');
  
  const id = 'c_' + Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id,
    payload.name,
    payload.phone || '',
    payload.photoUrl || '',
    payload.address || '',
    payload.notes || '',
    now,
    now
  ]);
  
  return success({ contactId: id });
}

// Edit contact
function handleEditContact(e) {
  const id = e.parameter.id;
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contacts');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      if(payload.name) data[i][1] = payload.name;
      if(payload.phone) data[i][2] = payload.phone;
      if(payload.photoUrl) data[i][3] = payload.photoUrl;
      if(payload.address) data[i][4] = payload.address;
      if(payload.notes) data[i][5] = payload.notes;
      data[i][7] = new Date().toISOString();
      
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return success(null, 'Contact updated');
    }
  }
  
  return error_response('Contact not found');
}

// Delete contact
function handleDeleteContact(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contacts');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return success(null, 'Contact deleted');
    }
  }
  
  return error_response('Contact not found');
}

// Get transactions
function handleGetTransactions(e) {
  const contactId = e.parameter.contactId;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  const transactions = [];
  for(let i = 1; i < data.length; i++) {
    if(data[i][1] === contactId && data[i][9] !== true) {
      const row = data[i];
      transactions.push({
        txId: row[0],
        contactId: row[1],
        datetime: row[2],
        type: row[3],
        amount: row[4],
        notes: row[5],
        imageUrls: row[6] ? JSON.parse(row[6]) : [],
        createdAt: row[7],
        updatedAt: row[8],
        deleted: row[9]
      });
    }
  }
  
  return success(transactions);
}

// Get single transaction
function handleGetTransaction(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      const row = data[i];
      return success({
        txId: row[0],
        contactId: row[1],
        datetime: row[2],
        type: row[3],
        amount: row[4],
        notes: row[5],
        imageUrls: row[6] ? JSON.parse(row[6]) : [],
        createdAt: row[7],
        updatedAt: row[8],
        deleted: row[9]
      });
    }
  }
  
  return error_response('Transaction not found');
}

// Add transaction
function handleAddTransaction(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  
  const id = 'tx_' + Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id,
    payload.contactId,
    payload.datetime,
    payload.type,
    payload.amount,
    payload.notes || '',
    JSON.stringify(payload.imageUrls || []),
    now,
    now,
    false
  ]);
  
  return success({ txId: id });
}

// Edit transaction
function handleEditTransaction(e) {
  const id = e.parameter.id;
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      if(payload.datetime) data[i][2] = payload.datetime;
      if(payload.type) data[i][3] = payload.type;
      if(payload.amount) data[i][4] = payload.amount;
      if(payload.notes !== undefined) data[i][5] = payload.notes;
      if(payload.imageUrls) data[i][6] = JSON.stringify(payload.imageUrls);
      data[i][8] = new Date().toISOString();
      
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return success(null, 'Transaction updated');
    }
  }
  
  return error_response('Transaction not found');
}

// Delete transaction
function handleDeleteTransaction(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      data[i][9] = true; // Mark as deleted
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return success(null, 'Transaction deleted');
    }
  }
  
  return error_response('Transaction not found');
}

// Upload image
function handleUploadImage(e) {
  const blob = e.parameter.file;
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = folder.createFile(blob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const url = 'https://drive.google.com/uc?id=' + file.getId();
  return success({ url: url });
}

// Helper functions
function calculateBalance(contactId) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  let balance = 0;
  for(let i = 1; i < data.length; i++) {
    if(data[i][1] === contactId && data[i][9] !== true) {
      if(data[i][3] === 'GIVE') {
        balance -= data[i][4];
      } else {
        balance += data[i][4];
      }
    }
  }
  
  return balance;
}

function getTransactionCount(contactId) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  let count = 0;
  for(let i = 1; i < data.length; i++) {
    if(data[i][1] === contactId && data[i][9] !== true) count++;
  }
  
  return count;
}

function getLastTransactionDate(contactId) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Transactions');
  const data = sheet.getDataRange().getValues();
  
  let lastDate = new Date(0);
  for(let i = 1; i < data.length; i++) {
    if(data[i][1] === contactId && data[i][9] !== true) {
      const date = new Date(data[i][2]);
      if(date > lastDate) lastDate = date;
    }
  }
  
  return lastDate.toISOString();
}
