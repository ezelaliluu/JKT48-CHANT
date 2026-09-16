from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/jadwal")
def get_jadwal():
    url = "https://jkt48.com/schedule"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True) 
        page = browser.new_page()
        
        page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        
        page.goto(url, wait_until="networkidle") 
        
        html = page.content()
        browser.close()
    
    soup = BeautifulSoup(html, 'html.parser')

    print(soup.prettify()) 
    
    
    items = soup.find_all('div', class_='schedule-item')
    print("Jumlah jadwal yang ditemukan:", len(items))
    
    hasil_jadwal = []
    
    items = soup.find_all('div', class_='schedule-item')
    
    for item in items:
        date_element = item.find('span', class_='text-primary')
        tanggal = date_element.text.strip() if date_element else "00"
        
        month_element = item.find('div', class_=lambda c: c and 'text-sm' in c and 'uppercase' in c)
        bulan = ""
        if month_element:
            teks_bulan = month_element.get_text(separator=" ", strip=True) 
            bulan = teks_bulan.split()[0] if teks_bulan else ""
        
        title_element = item.find('div', class_=lambda c: c and 'text-ellipsis' in c)
        title = title_element.text.strip() if title_element else "TBA"

        wib_text = item.find(string=lambda t: t and "WIB" in t)
        waktu = ""
        start_time = "00:00" 
        if wib_text and wib_text.parent and wib_text.parent.parent:
            waktu = wib_text.parent.parent.get_text(separator=" ", strip=True).replace("\xa0", " ")
            if "-" in waktu:
                start_time = waktu.split("-")[0].strip()[:5]

        team_element = item.find('span', class_='truncate')
        if team_element:
            tipe_event = team_element.text.strip()
        else:
            special_badge = item.find(lambda tag: tag.name == "div" and "bg-primary" in tag.get("class", []) and "text-white" in tag.get("class", []))
            if special_badge:
                tipe_event = special_badge.text.strip()
            else:
                tipe_event = "Teater"

        month_map = {
            "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04", "MAY": "05", "MEI": "05",
            "JUN": "06", "JUL": "07", "AUG": "08", "AGT": "08", "SEP": "09", "OCT": "10", 
            "OKT": "10", "NOV": "11", "DEC": "12", "DES": "12"
        }
        bulan_angka = month_map.get(bulan.upper(), "00")
        sort_key = f"{bulan_angka}-{tanggal.zfill(2)} {start_time}"       

        hasil_jadwal.append({
            "date": tanggal,
            "day": bulan,
            "type": tipe_event,
            "time": waktu,
            "title": title,
            "_sort_key": sort_key
        })

    hasil_jadwal_urut = sorted(hasil_jadwal, key=lambda x: x["_sort_key"])

    for jadwal in hasil_jadwal_urut:
        del jadwal["_sort_key"]    
        
    return {"data": hasil_jadwal_urut}