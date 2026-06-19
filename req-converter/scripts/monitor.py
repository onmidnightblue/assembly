from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
import time
import tkinter as tk
from tkinter import messagebox

# CONFIG
TARGET_URL = "https://naps.assembly.go.kr:444/reqsubmit/10_mem/20_reqboxsh/10_make/SMakeReqBoxList.jsp?clickno=22"
CHECK_INTERVAL = 300 # 5분
TITLE_COLUMN_INDEX = 1 # 글 제목

# ALERT
def show_alert(title):
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)
    messagebox.showinfo("알림", f"새로운 요구서가 도착했습니다:\n\n{title}")
    root.destroy()

# SETTINGS
options = Options()
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Edge(options=options) 
driver.get(TARGET_URL)

# WAIT FOR LOGIN
time.sleep(60)

# EXECUTE
last_latest_title = ""
def check_new_posts():
    global last_latest_title
    try: 
        driver.refresh()
        time.sleep(3)
        
        table = driver.find_element(By.CSS_SELECTOR, "table.table.list.default.mb10")
        rows = table.find_elements(By.CSS_SELECTOR, "tbody > tr")
        
        if rows:
            cells = rows[0].find_elements(By.TAG_NAME, "td")
            if len(cells) > TITLE_COLUMN_INDEX:
                current_title = cells[TITLE_COLUMN_INDEX].text.strip()
                
                if last_latest_title != "" and current_title != last_latest_title:
                    show_alert(current_title)
                
                last_latest_title = current_title
            
    except Exception as e:
        print(f"Error: {e}")

# INFINITE LOOP
while True:
    check_new_posts()
    time.sleep(CHECK_INTERVAL)