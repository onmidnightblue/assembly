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