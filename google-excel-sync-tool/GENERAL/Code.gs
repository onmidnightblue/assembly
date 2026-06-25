const MAIN_ID = 'YOUR_GENERAL_FILE_CODE';

function doPost(e) {
  const ss = SpreadsheetApp.openById(MAIN_ID);
  const sheet = ss.getSheetByName('Report');
  const data = JSON.parse(e.postData.contents);
  
  // 데이터 입력 전 uuid 생성
  if (data.action === 'init') {
    const newId = Utilities.getUuid();
    return ContentService.createTextOutput(newId).setMimeType(ContentService.MimeType.TEXT);
  }

  // 부서별 시트에서 부서명을 작성하지 않아도 되도록 이전에 입력한 가장 마지막 데이터를 기본값으로 제공
  if (data.action === 'getLastData') {
    const values = sheet.getDataRange().getValues();
    let lastRowData = null;
    
    const getCleanName = (name) => {
      return String(name).split('(')[0].replace(/\r?\n|\r/g, "").trim().toLowerCase();
    };

    const targetDept = getCleanName(data.deptName);
    
    for (let i = values.length - 1; i >= 5; i--) { 
      const sheetDept = getCleanName(values[i][4]);
      if (sheetDept === targetDept) {
        lastRowData = values[i];
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify(lastRowData || []))
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // uuid가 있으면 수정하고, 없으면 마지막 줄에 추가
  if (data.action === 'update') {
    const id = data.id;
    const payload = data.payload; 
    
    const idColumn = sheet.getRange("A:A").getValues();
    let rowFound = -1;
    for (let i = 0; i < idColumn.length; i++) {
      if (idColumn[i][0] === id) {
        rowFound = i + 1;
        break;
      }
    }
    
    if (rowFound > 0) {
      sheet.getRange(rowFound, 1, 1, payload.length).setValues([payload]);
    } else {
      const nextRow = Math.max(sheet.getLastRow() + 1, 6);
      sheet.getRange(nextRow, 1, 1, payload.length).setValues([payload]);
    }
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }

  // uuid를 기준으로 해당 행을 찾아 삭제
  if (data.action === 'delete') {
    const id = data.id;
    const idColumn = sheet.getRange("A:A").getValues();
    for (let i = 0; i < idColumn.length; i++) {
      if (String(idColumn[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput("Success");
      }
    }
    return ContentService.createTextOutput("Not Found");
  }

}

// 컬럼 1~10에 내용이 작성되면 자동으로 uuid 부여하고, 내용이 없으면 자동 삭제
function generateUuidForNewRows(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  if (sheet.getName() !== "Report") return;

  const startRow = range.getRow();
  const endRow = range.getLastRow();
  
  for (let row = startRow; row <= endRow; row++) {
    if (row < 6) continue;
    
    const idCell = sheet.getRange(row, 1);
    const dataRange = sheet.getRange(row, 2, 1, 10);
    const rowValues = dataRange.getValues()[0];
    
    const isRowEmpty = rowValues.every(val => val === "" || val === null || val === undefined);
    
    if (isRowEmpty) {
      if (idCell.getValue() !== "") {
        idCell.clearContent();
      }
    } else {
      if (idCell.getValue() === "") {
        idCell.setValue(Utilities.getUuid());
      }
    }
  }
}