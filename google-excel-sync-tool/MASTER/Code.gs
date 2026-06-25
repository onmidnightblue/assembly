// --------------- CONSTANTS ---------------
const FOLDER_ID = '1pH1DCPGOVavkdxfdNSgcix_jYWs2b9Gy'
const MAIN_ID = '1wLYJ5ZF3QnKCGxs8owTRbWGnUkClDh0I6KswJpA2utk';
const MASTER_ID = '15ZvRuSGk6t9gNZ7_v9_Y6N4b1StqCYxlY9qcXKKluNo'
const TEMPLATE_ID = '1FwnpGAMpdO1ITI25nZvTawQj2onPkJ4ZvPFhUoKlcio'
const MAIN_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzKa1VGvNxykR7f3rtU1WE0fyizCKFUi-JL3r-h9ljsCpk_iL6FQNPgmmi0JtacFJNpMg/exec'; 

const START_DATA_ROW = 6;
const START_EMAIL_ROW = 4;
const EMAIL_NAME = 'Settings'
const FILE_SUFFIX = '_Report'

const INNER_DATA_MAP = {
  CHECKBOX: 1,
  ID: 2,
};

const EXPORT_FIELDS = ['id', 'Date', 'Instruction', 'Description', 'Department', 'Manager', 'Status', 'StatusDetail', 'Note', 'KeyProject'];

const WORKER_IMPORTRANGE = (deptName) => '=QUERY(IMPORTRANGE("' + MAIN_ID + '", "Report!A6:J"), "SELECT * WHERE Col5 CONTAINS \'' + deptName + '\'", 0)'

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

// 권한 추가 및 파일 생성
function createWorkerFile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailSheet = ss.getSheetByName(EMAIL_NAME);
  const templateFile = DriveApp.getFileById(TEMPLATE_ID);
  const targetFolder = DriveApp.getFolderById(FOLDER_ID); 
  const masterFile = DriveApp.getFolderById(MASTER_ID); 
  const mainFile = DriveApp.getFileById(MAIN_ID);
  
  const lastRow = emailSheet.getLastRow();
  const data = emailSheet.getRange(START_EMAIL_ROW, 1, lastRow - START_EMAIL_ROW + 1, 4).getValues();
  const ownerEmail = mainFile.getOwner().getEmail();
  const activeUser = Session.getActiveUser().getEmail();
  
  const allFiles = [mainFile];
  const iter = targetFolder.getFiles();
  while(iter.hasNext()) allFiles.push(iter.next());
  
  // 권한 초기화
  allFiles.forEach(file => {
    file.getEditors().forEach(editor => {
      const email = editor.getEmail();
      if (email !== ownerEmail && email !== activeUser) {
        file.removeEditor(email);
      }
    });
  });

  data.forEach((row) => {
    const group = String(row[0]).trim();
    const deptName = String(row[1]).trim().replace(/\s*\(.*?\)$/, "");
    const email = String(row[3]).trim();
    
    if (!email) return;

    // 부서별 파일이 없는 경우 생성
    let target = allFiles.find(f => f.getName() === deptName + FILE_SUFFIX);
    if (!target) {
      target = templateFile.makeCopy(deptName + FILE_SUFFIX, targetFolder);
      const workerSS = SpreadsheetApp.open(target);
      const sheet = workerSS.getSheets()[0];
      sheet.getRange("B6").setFormula(WORKER_IMPORTRANGE(deptName));
      sheet.getRange("A6:A" + sheet.getMaxRows()).insertCheckboxes();
      allFiles.push(target);
    }

    // 권한 부여
    if (group === "A") {
    mainFile.addEditor(email);
    masterFile.addEditor(email);
    templateFile.addEditor(email);
      allFiles.forEach(file => {
        if (file.getName().endsWith(FILE_SUFFIX)) {
          file.addEditor(email);
        }
      });
    } 
    else if (group === "B") {
      mainFile.addEditor(email);
    } 
    else if (group === "C") {
      if (target) target.addEditor(email);
    }
  });
 
 SpreadsheetApp.getUi().alert("Synchronization complete.");
}


