import time
import re
import pandas as pd
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# CONFIG
TARGET_URL = "https://www.facebook.com/chojs21" # 수집할 페이스북 URL
TARGET_DATE = datetime(2026, 3, 20) # 중단할 날짜 (포함됨)
BATCH_SIZE = 100 # 분할 저장할 단위
EXCLUDE_WORDS = ["모든 공감", "좋아요", "댓글", "공유하기", "답글", "공감"] # 게시물에서 제거할 불필요 단어

# DATE CONVERTER
def parse_facebook_date(date_str):
    now = datetime.now()
    
    # 상대 시간
    if any(x in date_str for x in ['방금', '분', '시간']):
        return now
    if '어제' in date_str:
        return now - timedelta(days=1)
        
    # "YYYY년 M월 D일" 
    full_match = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', date_str)
    if full_match:
        y, m, d = map(int, full_match.groups())
        return datetime(y, m, d)
        
    # "M월 D일" 
    short_match = re.search(r'(\d{1,2})월\s*(\d{1,2})일', date_str)
    if short_match:
        m, d = map(int, short_match.groups())
        dt = datetime(now.year, m, d)
        return dt if dt <= now else dt.replace(year=now.year - 1)
        
    # "n일 전" 형태
    days_match = re.search(r'(\d+)일', date_str)
    if days_match:
        return now - timedelta(days=int(days_match.group(1)))
        
    return None

# CLEAN
def clean_content(body_lines):
    body = []
    for line in body_lines:
        line_s = line.strip()
        if re.fullmatch(r'\+?\d+', line_s): continue
        if any(w in line_s for w in EXCLUDE_WORDS): break
        body.append(line)
    content = " ".join(body).strip().lstrip('·').strip()
    content = content.replace("적게 보기", "")
    content = re.sub(r'\d{1,2}:\d{2}\s*/\s*\d{1,2}:\d{2}', '', content)
    content = re.sub(r'\b\d{1,2}:\d{2}\b', '', content)
    content = re.sub(r'\d+(\.\d+)?천', '', content)
    content = re.sub(r'\+\d+장', '', content)
    return re.sub(r'\s+', ' ', content).strip()

# EXECUTE
def run_collector():
    options = Options()
    options.add_argument("--disable-notifications") # 알림창 차단
    options.add_argument("--start-maximized")
    driver = webdriver.Edge(options=options)
    driver.get(TARGET_URL)

    # WAIT FOR LOGIN
    time.sleep(60)

    data = []
    seen = set() # 중복 방지
    file_idx = 1
    while True:
        try:
            main = driver.find_element(By.CSS_SELECTOR, 'div[role="main"]')
            
            # 더보기 버튼 클릭
            more_btns = main.find_elements(By.XPATH, ".//span[text()='더 보기'] | .//div[text()='더 보기']")
            for btn in more_btns:
                try: driver.execute_script("arguments[0].click();", btn)
                except: pass

            # 본격적인 게시물 수집
            articles = main.find_elements(By.CSS_SELECTOR, 'div[role="article"]')
            for article in articles:
                try:
                    text_lines = article.text.split('\n')
                    if len(text_lines) < 3: continue
                    
                    post_dt = parse_facebook_date(text_lines[1])
                    if not post_dt: continue

                    # TARGET_DATE 이전 날짜면 최종 저장 후 종료
                    if post_dt < TARGET_DATE:
                        if data: pd.DataFrame(data).to_excel(f"facebook_final_{datetime.now().strftime('%H%M%S')}.xlsx", index=False)
                        driver.quit()
                        return

                    content = clean_content(text_lines[2:])
                    if content and content not in seen:
                        seen.add(content)
                        data.append({"createAt": post_dt.strftime('%Y.%m.%d.'), "content": content})
                        print(f"★ {len(seen)} | {post_dt.strftime('%Y.%m.%d.')} | {content[:20]}")

                        # 100개 이상 쌓일 경우 한 번 저장
                        if len(data) >= BATCH_SIZE:
                            pd.DataFrame(data).to_excel(f"facebook_{file_idx}_{datetime.now().strftime('%H%M%S')}.xlsx", index=False)
                            data = []
                            file_idx += 1
                except: continue
        except: pass

        # 스크롤
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        time.sleep(0.8)

if __name__ == "__main__":
    run_collector()