    Const MASTER_SHEET_NAME As String = "총괄"
    Const HEADER_ROWS As Long = 5
    Const START_ROW As Long = HEADER_ROWS + 1
    Const DEPART_COL As String = "E"
    Const LAST_COL As String = "H"
    Const EXPORT_FOLDER_NAME As String = "\부서별파일"
    
    Function GenerateID(rowNumber As Long) As String
        GenerateID = "ID-" & Format(Date, "yy") & "-" & Format(rowNumber, "000")
    End Function

Sub 단추1_Click()
    Dim masterSheet As Worksheet, newSheet As Worksheet, ws As Worksheet
    Dim lastRow As Long, i As Long, deptName As String, nextRow As Long

    Set masterSheet = ThisWorkbook.Sheets(MASTER_SHEET_NAME)
    
    'E열 기준으로 데이터의 마지막 행 번호를 찾고, 6행부터 계산
    lastRow = masterSheet.Cells(masterSheet.Rows.Count, DEPART_COL).End(xlUp).Row
    
    '화면업데이트 차단/경고창 무시
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    '부서별 시트 일괄 삭제
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> MASTER_SHEET_NAME Then ws.Delete
    Next ws
    
    '실행
    For i = 6 To lastRow
        'ID 자동 생성
        If masterSheet.Cells(i, 1).Value = "" Then
            masterSheet.Cells(i, 1).Value = GenerateID(i)
        End If
        
        'E열 부서명을 이름으로 가진 시트 생성
        deptName = Trim(masterSheet.Cells(i, DEPART_COL).Value)
        If deptName <> "" Then
            '시트 확인
            Set newSheet = Nothing
            On Error Resume Next
            Set newSheet = ThisWorkbook.Sheets(deptName)
            On Error GoTo 0
            
            '시트 새로 생성 후 총괄 시트의 5개행 복사 (헤더)
            If newSheet Is Nothing Then
                Set newSheet = Sheets.Add(After:=Sheets(Sheets.Count))
                newSheet.Name = deptName
                masterSheet.Rows("1:" & HEADER_ROWS).Copy newSheet.Rows(1)
            End If
            
            '부서별 시트의 마지막 행 아래에 데이터 추가
            nextRow = newSheet.Cells(newSheet.Rows.Count, "A").End(xlUp).Row + 1
            If nextRow < START_ROW Then nextRow = START_ROW

            With newSheet.Rows(nextRow)
                masterSheet.Rows(i).Copy
                .PasteSpecial Paste:=xlPasteAllUsingSourceTheme '서식유지
                .PasteSpecial Paste:=xlPasteColumnWidths '열 너비 유지
            .AutoFit '행 높이 자동맞춤
            End With
            
            Set newSheet = Nothing '시트 객체 초기화
        End If
    Next i
    
    '최적화 설정 복구
    Application.CutCopyMode = False: Application.DisplayAlerts = True: Application.ScreenUpdating = True
    MsgBox "부서별 시트 생성 완료"
End Sub

Sub 단추2_Click()
    Dim masterSheet As Worksheet, wsDept As Worksheet
    Dim i As Long, lastRow As Long, found As Range
    Dim idToFind As Variant
    Dim nextMasterRow As Long
    Dim deptCount As Integer '처리된 부서 개수를 셀 변수 추가
    
    Set masterSheet = ThisWorkbook.Sheets(MASTER_SHEET_NAME)
    Application.ScreenUpdating = False: Application.DisplayAlerts = False
    
    deptCount = 0 '초기화
    
    '부서별 시트를 순회하여 총괄시트로 데이터 반영
    For Each wsDept In ThisWorkbook.Worksheets
        If wsDept.Name <> MASTER_SHEET_NAME Then
            deptCount = deptCount + 1 '부서 시트를 발견하면 카운트 증가
            
            lastRow = wsDept.Cells(wsDept.Rows.Count, DEPART_COL).End(xlUp).Row
            
            '6행부터 순회
            If lastRow >= START_ROW Then
                For i = START_ROW To lastRow
                    idToFind = wsDept.Cells(i, 1).Value
                    
                    '총괄 시트에 ID가 있는 경우 수정
                    If idToFind <> "" Then
                        Set found = masterSheet.Columns("A").Find(What:=idToFind, LookAt:=xlWhole)
                        If Not found Is Nothing Then
                            masterSheet.Range("A" & found.Row & ":" & LAST_COL & found.Row).Value = _
                            wsDept.Range("A" & i & ":" & LAST_COL & i).Value
                        End If
                    
                    '총괄 시트에 ID가 없는 경우 신규 추가
                    Else
                        nextMasterRow = masterSheet.Cells(masterSheet.Rows.Count, "A").End(xlUp).Row + 1
                        If nextMasterRow <= HEADER_ROWS Then nextMasterRow = START_ROW
                        
                        wsDept.Range("A" & i & ":" & LAST_COL & i).Copy
                        masterSheet.Range("A" & nextMasterRow).PasteSpecial Paste:=xlPasteValues
                        masterSheet.Cells(nextMasterRow, 1).Value = GenerateID(nextMasterRow)
                        Application.CutCopyMode = False
                    End If
                Next i
            End If
        End If
    Next wsDept
    
    Application.ScreenUpdating = True
    
    '부서 시트가 하나도 없었을 경우 알림
    If deptCount = 0 Then
        MsgBox "반영할 부서별 시트가 없습니다. 총괄->부서 버튼을 눌러 시트를 생성해 주세요.", vbExclamation, "알림"
    Else
        MsgBox "총 " & deptCount & "개 부서의 데이터가 총괄 시트로 동기화되었습니다.", vbInformation, "작업 성공"
    End If
End Sub

Sub 단추3_Click()
    Dim ws As Worksheet
    
    '시트 삭제 시 나오는 팝업 무시
    Application.DisplayAlerts = False
    
    '총괄 시트를 제외한 모든 시트 삭제
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> MASTER_SHEET_NAME Then
            ws.Delete
        End If
    Next ws
    
    '시트 삭제 팝업 복구
    Application.DisplayAlerts = True
    MsgBox "시트 삭제 완료"
End Sub

Sub 단추4_Export_Click()
    Dim ws As Worksheet, wbNew As Workbook
    Dim exportPath As String, safeName As String, fullPath As String
    Dim fso As Object
    Dim deptCount As Integer
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    '경로
    exportPath = ThisWorkbook.Path & "\부서별파일"
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    '폴더가 없으면 생성
    If Not fso.FolderExists(exportPath) Then fso.CreateFolder exportPath
    
    deptCount = 0
    
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> MASTER_SHEET_NAME Then
            deptCount = deptCount + 1
            
            '부서명 줄바꿈 제거 및 괄호 앞부분만 추출
            safeName = Replace(Replace(ws.Name, vbCr, ""), vbLf, "")
            Dim bracketPos As Integer
            bracketPos = InStr(safeName, "(")
            If bracketPos > 0 Then
                safeName = Trim(Left(safeName, bracketPos - 1))
            Else
                safeName = Trim(safeName)
            End If
            
            fullPath = exportPath & "\" & safeName & ".xlsx"
            
            '기존 파일 삭제
            On Error Resume Next
            If fso.FileExists(fullPath) Then fso.DeleteFile fullPath, True
            On Error GoTo 0
            
            '시트 복사
            ws.Copy
            Set wbNew = ActiveWorkbook
            
            '버튼 제거
            On Error Resume Next
            wbNew.Sheets(1).Shapes.SelectAll
            Selection.Delete
            On Error GoTo 0
            
            '저장 및 닫기
            On Error Resume Next
            wbNew.SaveAs fileName:=fullPath, FileFormat:=51
            wbNew.Close SaveChanges:=False
            On Error GoTo 0
        End If
    Next ws
    
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    
    '작업 결과 안내
    If deptCount > 0 Then
        MsgBox "총 " & deptCount & "개의 부서 파일이 저장되었습니다.", vbInformation, "내보내기 완료"
        Shell "explorer.exe " & exportPath, vbNormalFocus
    Else
        MsgBox "내보낼 부서별 탭이 없습니다. 총괄->부서 버튼을 눌러 부서별 시트를 생성해 주세요.", vbExclamation, "내보내기 중단"
    End If
End Sub

Sub 단추5_Import_Click()
    Dim folderPath As String, fileName As String
    Dim wbImport As Workbook, wsImport As Worksheet, wsTarget As Worksheet
    Dim lastRow As Long, ws As Worksheet
    Dim searchName As String, tabNameBase As String
    Dim processedCount As Integer '처리된 파일 개수 저장
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    processedCount = 0 '초기화
    folderPath = ThisWorkbook.Path & "\부서별파일\"
    fileName = Dir(folderPath & "*.xlsx")

    Do While fileName <> ""
        If Left(fileName, 2) <> "~$" Then
            searchName = Trim(Replace(fileName, ".xlsx", ""))
            
            Set wsTarget = Nothing
            For Each ws In ThisWorkbook.Worksheets
                Dim cleanName As String
                cleanName = Replace(Replace(ws.Name, vbCr, ""), vbLf, "")
                
                Dim bPos As Integer: bPos = InStr(cleanName, "(")
                If bPos > 0 Then
                    tabNameBase = Trim(Left(cleanName, bPos - 1))
                Else
                    tabNameBase = Trim(cleanName)
                End If
                
                If tabNameBase = searchName Then
                    Set wsTarget = ws
                    Exit For
                End If
            Next ws

            If Not wsTarget Is Nothing Then
                Set wbImport = Workbooks.Open(folderPath & fileName, ReadOnly:=True)
                Set wsImport = wbImport.Sheets(1)
                
                lastRow = wsImport.Cells(wsImport.Rows.Count, "E").End(xlUp).Row
                
                If lastRow >= 6 Then
                    wsTarget.Rows("6:" & wsTarget.Rows.Count).Clear
                    wsImport.Range("A6:" & LAST_COL & lastRow).Copy
                    wsTarget.Range("A6").PasteSpecial xlPasteAll
                    
                    processedCount = processedCount + 1 '파일 하나 성공할 때마다 증가
                End If
                wbImport.Close False
            End If
        End If
        fileName = Dir
    Loop

    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    
    If processedCount > 0 Then
        MsgBox "총 " & processedCount & "개의 부서 데이터가 반영되었습니다.", vbInformation, "작업 성공"
    Else
        MsgBox "불러올 수 있는 부서 파일이 없거나 이름이 일치하지 않습니다.", vbExclamation, "작업 중단"
    End If
End Sub

Sub 단추6_master_export_Click()
    Dim ws As Worksheet, wbNew As Workbook
    Dim exportPath As String, fileName As String
    Dim fso As Object
    
    '설정 및 경로 확인
    Set ws = ThisWorkbook.Sheets(MASTER_SHEET_NAME)
    exportPath = ThisWorkbook.Path & "\총괄"
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    '폴더가 없으면 생성
    If Not fso.FolderExists(exportPath) Then fso.CreateFolder exportPath
    
    '파일명 설정
    fileName = exportPath & "\" & MASTER_SHEET_NAME & "_" & Format(Now, "yyyymmdd_hhnnss") & ".xlsx"
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    '시트 복사
    ws.Copy
    Set wbNew = ActiveWorkbook
    
    '버튼 제거
    On Error Resume Next
    wbNew.Sheets(1).Shapes.SelectAll
    Selection.Delete
    On Error GoTo 0
    
    '저장 및 닫기
    On Error Resume Next
    wbNew.SaveAs fileName:=fileName, FileFormat:=51
    If Err.Number <> 0 Then
        Application.Wait (Now + TimeValue("0:00:01"))
        wbNew.SaveAs fileName:=fileName, FileFormat:=51
    End If
    wbNew.Close SaveChanges:=False
    On Error GoTo 0
    
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    
    MsgBox "총괄 시트가 저장되었습니다."
End Sub
