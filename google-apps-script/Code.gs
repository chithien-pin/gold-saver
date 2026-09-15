/**
 * Google Apps Script cho Gold Calculate
 *
 * Cột sheet (dòng 1):
 * id | type | goldType | quantity | pricePerChi | date | note
 *
 * Tab mặc định: GoldChild / GoldMom
 *
 * Deploy: Deploy → New deployment → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 */

var DEFAULT_SHEET = 'GoldChild'
var HEADERS = ['id', 'type', 'goldType', 'quantity', 'pricePerChi', 'date', 'note']

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var name = sheetName || DEFAULT_SHEET
  var sheet = ss.getSheetByName(name)
  if (!sheet) sheet = ss.getSheetByName(DEFAULT_SHEET)
  if (!sheet) sheet = ss.getActiveSheet()
  if (!sheet) throw new Error('Không tìm thấy sheet: ' + name)
  ensureHeaders(sheet)
  return sheet
}

function ensureHeaders(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length)
  var firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  var hasHeader = firstRow[0] === 'id'
  if (!hasHeader && sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
  }
}

function findRowById(sheet, id) {
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return -1
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2
  }
  return -1
}

function rowToObject(headers, values) {
  var row = {}
  for (var j = 0; j < headers.length; j++) {
    row[headers[j]] = values[j]
  }
  return row
}

/** GET ?sheet=GoldChild */
function doGet(e) {
  try {
    var params = (e && e.parameter) || {}
    var sheet = getSheet(params.sheet)
    var data = sheet.getDataRange().getValues()
    if (!data || data.length < 2) return jsonOutput([])

    var headers = data[0]
    var rows = []
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue
      rows.push(rowToObject(headers, data[i]))
    }
    return jsonOutput(rows)
  } catch (err) {
    return jsonOutput({ error: String(err.message || err) })
  }
}

/**
 * POST body JSON:
 * - Add:    { sheet, id, type, goldType, quantity, pricePerChi, date, note }
 * - Update: { action: 'update', sheet, id, type, goldType, quantity, pricePerChi, date, note }
 * - Delete: { action: 'delete', sheet, id }
 */
function doPost(e) {
  try {
    var body = {}
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents)
    }

    var sheet = getSheet(body.sheet)
    var action = body.action || 'add'

    if (action === 'delete') {
      return handleDelete(sheet, body)
    }
    if (action === 'update') {
      return handleUpdate(sheet, body)
    }
    return handleAdd(sheet, body)
  } catch (err) {
    return jsonOutput({ error: String(err.message || err) })
  }
}

function handleAdd(sheet, body) {
  if (!body.id) return jsonOutput({ error: 'Thiếu id' })

  sheet.appendRow([
    String(body.id),
    body.type || 'buy',
    body.goldType || '',
    Number(body.quantity) || 0,
    Number(body.pricePerChi) || 0,
    body.date || '',
    body.note || '',
  ])

  return jsonOutput({ success: true, action: 'add', id: body.id })
}

function handleUpdate(sheet, body) {
  if (!body.id) return jsonOutput({ error: 'Thiếu id' })

  var rowIndex = findRowById(sheet, body.id)
  if (rowIndex < 0) {
    return jsonOutput({ error: 'Không tìm thấy giao dịch', id: body.id })
  }

  sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([[
    String(body.id),
    body.type || 'buy',
    body.goldType || '',
    Number(body.quantity) || 0,
    Number(body.pricePerChi) || 0,
    body.date || '',
    body.note || '',
  ]])

  return jsonOutput({ success: true, action: 'update', id: body.id })
}

function handleDelete(sheet, body) {
  if (!body.id) return jsonOutput({ error: 'Thiếu id' })

  var rowIndex = findRowById(sheet, body.id)
  if (rowIndex < 0) {
    return jsonOutput({ error: 'Không tìm thấy giao dịch', id: body.id })
  }

  sheet.deleteRow(rowIndex)
  return jsonOutput({ success: true, action: 'delete', id: body.id })
}
