# 70개가 넘는 .mp4 파일 재생시간 추출기

70여개의 영상의 재생시간을 엑셀 파일에 기입해달라는 요청을 받았다. 한 폴더 내에 뎁스 없이 모든 영상 파일이 있으면 바로 확인하고 적을 수 있겠지만.. ~~아니 사실 이 방법도 손으로 기입해야 하는 것이기 때문에 오기재 가능성이 높다.~~ 폴더 구조가 대략 이랬다.

```
.
├──  부서명
│   ├── 사람 이름
│   │   ├── 한글파일
│   │   ├── 영상파일 < target!
│   │   └── 기타 등등 파일
│   ├── 사람 이름
│   ...
...
```

70개나.. 다 들어가서 보기란.. 아주 귀찮은.. 그래서 추출기를 만들어 보기로 했다.

<br>

원래라면 내가 해야하는 일은 이렇다.

1. 부서명 폴더에 들어간다.
2. 사람 이름 폴더에 들어간다.
3. 영상 파일을 한 번 클릭한다.
4. 미리 켜둔 상세정보 보기로 재생시간을 확인한 후 엑셀 파일에 기입한다.
5. 무한 반복한다.

<br>

내 자리 컴퓨터의 환경은 window이고, 주로 사용하는 브라우저는 microsoft edge이다.

<details>
<summary>extracter.ps1</summary>

```
$shell = New-Object -ComObject Shell.Application # shell 객체 생성
$folderPath = Get-Location # 현재 폴더 경로
$files = Get-ChildItem -Path $folderPath -Recurse -Filter *.mp4 # 해당 폴더 및 모든 하위 폴더에서 확장자가 .mp4인 파일만 검색

# 파일명, 재생시간, 전체 경로 추출
$results = foreach ($file in $files) {
    $folder = $shell.Namespace($file.DirectoryName)
    $f = $folder.ParseName($file.Name)
    $duration = $folder.GetDetailsOf($f, 27) # 미디어 파일의 재생시간 속성: 27

    [PSCustomObject]@{
        FileName = $file.Name
        Duration = $duration
        FullPath = $file.FullName
    }
}

$results | Export-Csv -Path "video_info.csv" -NoTypeInformation -Encoding UTF8
Write-Host "video_info.csv 파일을 확인해주세요."
```

</details>

<br>

위 코드는 cmd 창을 열고 해당 폴더의 경로로 이동한 후,<br>
코드를 그대로 붙여넣으면 금방 같은 폴더 내에 엑셀 파일이 만들어진다.
전달해야하는 엑셀 파일에 재생시간만 그대로 붙여넣으면 끝!

<br>

덧붙이는 글.<br>
원하는 경로로 설정할 때 특수문자나 띄어쓰기가 있는 경우 찾을 수 없다며 오류를 내뱉었다. 분명 폴더 상단 경로를 그대로 복사해서 붙여넣은 건데도!! '업무기록' 처럼 단순한 경우는 괜찮지만 '2026.06.15 재생시간 추출기' 같은 이름은 바로 찾아갈 수 없었다. 따옴표를 쓰거나 해서 접근할 수 있다는 사실을 알게 되었다.
