// --------------- CONSTANTS ---------------
const MAIN_ID = '1wLYJ5ZF3QnKCGxs8owTRbWGnUkClDh0I6KswJpA2utk';
const MAIN_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzKa1VGvNxykR7f3rtU1WE0fyizCKFUi-JL3r-h9ljsCpk_iL6FQNPgmmi0JtacFJNpMg/exec'; 

const START_DATA_ROW = 6;

const INNER_DATA_MAP = {
  CHECKBOX: 1,
  ID: 2,
};

const EXPORT_FIELDS = ['id', 'Date', 'Instruction', 'Description', 'Department', 'Manager', 'Status', 'StatusDetail', 'Note', 'KeyProject'];

const formatDate = (date) => {
  if (!(date instanceof Date)) return date;
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
};


// ----------------- CORE -----------------
// Index.html 모달창 열기
function displayModal(rowData) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.data = rowData
  SpreadsheetApp.getUi().showModalDialog(template.evaluate().setWidth(400).setHeight(750), 'Report');
}

// 데이터 추가
function addData() {
  const response = UrlFetchApp.fetch(MAIN_WEBAPP_URL, {
    method: "post", contentType: "application/json",
    payload: JSON.stringify({ action: 'init' })
  });
  const newId = response.getContentText();
  const dataToDisplay = {};
  EXPORT_FIELDS.forEach((field) => {
    dataToDisplay[field] = (field === 'id') ? newId : ""; 
  });

  displayModal(dataToDisplay);
}

// 데이터 수정
function editData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < START_DATA_ROW) {
    SpreadsheetApp.getUi().alert("No data available.");
    return;
  }
  
  const rowCount = lastRow - START_DATA_ROW + 1;
  const checkboxRange = sheet.getRange(START_DATA_ROW, INNER_DATA_MAP.CHECKBOX, rowCount, 1);
  const idRange = sheet.getRange(START_DATA_ROW, INNER_DATA_MAP.ID, rowCount, 1);
  const checkboxValues = checkboxRange.getValues();
  const idValues = idRange.getValues();
  
  let selectedRow = -1;
  let count = 0;
  
  for (let i = 0; i < checkboxValues.length; i++) {
    if (checkboxValues[i][0] === true && idValues[i][0] !== "") {
      selectedRow = START_DATA_ROW + i;
      count++;
    } else if (checkboxValues[i][0] === true && idValues[i][0] === "") {
      checkboxRange.getCell(i + 1, 1).setValue(false);
    }
  }
  
  if (count === 0) {
    SpreadsheetApp.getUi().alert("Please select the checkbox for the item containing data to be modified.");
    return;
  }
  if (count > 1) {
    SpreadsheetApp.getUi().alert("Please select only one checkbox.");
    return;
  }
  
  const rowData = sheet.getRange(selectedRow, INNER_DATA_MAP.ID, 1, 10).getValues()[0];

  const dataToDisplay = {};
  EXPORT_FIELDS.forEach((field, index) => {
    let value = rowData[index];
    if (field === 'Date') value = formatDate(value);
    dataToDisplay[field] = value;
  });

  displayModal(dataToDisplay);
}

// Index.html에서 데이터 삭제
function deleteDataById(id) {
  return UrlFetchApp.fetch(MAIN_WEBAPP_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ action: 'delete', id: id })
  }).getContentText();
}

// Index.html에서 데이터 전송
function processForm(formData) {
  const payload = EXPORT_FIELDS.map(field => formData[field]);
  UrlFetchApp.fetch(MAIN_WEBAPP_URL, {
    method: "post", contentType: "application/json",
    payload: JSON.stringify({ action: 'update', id: formData.id, payload: payload })
  });
}