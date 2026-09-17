import os
import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

logger = logging.getLogger("uvicorn")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_FILE = os.path.join(os.path.dirname(__file__), "jadwal_cache.json")

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and "data" in data and len(data["data"]) > 0:
                    return {
                        "periode": data.get("periode", "September 2026"),
                        "data": data["data"]
                    }
        except Exception as e:
            logger.error(f"Gagal membaca cache: {e}")
    return None

def save_cache(events, periode=None):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "periode": periode or "September 2026",
                "data": events
            }, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Gagal menyimpan cache: {e}")

def scrape_official():
    url = "https://jkt48.com/schedule"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="id-ID"
        )
        page = context.new_page()
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page.goto(url, wait_until="networkidle", timeout=15000)
        html = page.content()
        browser.close()

    soup = BeautifulSoup(html, "html.parser")
    items = soup.find_all("div", class_="schedule-item")
    print("Jumlah jadwal yang ditemukan:", len(items))

    comboboxes = soup.find_all("button", role="combobox")
    teks_bulan = ""
    teks_tahun = ""

    if len(comboboxes) >= 2:
        span_bulan = comboboxes[0].find("span", class_="truncate")
        span_tahun = comboboxes[1].find("span", class_="truncate")

        if span_bulan:
            teks_bulan = span_bulan.text.strip()
        if span_tahun:
            teks_tahun = span_tahun.text.strip()

    periode_jadwal = f"{teks_bulan} {teks_tahun}".strip()

    if not items:
        return {
            "periode": periode_jadwal or "September 2026",
            "data": []
        }

    hasil_jadwal = []
    month_map = {
        "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04", "MAY": "05", "MEI": "05",
        "JUN": "06", "JUL": "07", "AUG": "08", "AGT": "08", "SEP": "09", "OCT": "10",
        "OKT": "10", "NOV": "11", "DEC": "12", "DES": "12"
    }

    for item in items:
        date_element = item.find("span", class_="text-primary")
        tanggal = date_element.text.strip() if date_element else "00"

        month_element = item.find("div", class_=lambda c: c and "text-sm" in c and "uppercase" in c)
        bulan = ""
        if month_element:
            teks_bulan_item = month_element.get_text(separator=" ", strip=True)
            bulan = teks_bulan_item.split()[0] if teks_bulan_item else ""

        title_element = item.find("div", class_=lambda c: c and "text-ellipsis" in c)
        title = title_element.text.strip() if title_element else "TBA"

        wib_text = item.find(string=lambda t: t and "WIB" in t)
        waktu = ""
        start_time = "00:00"
        if wib_text and wib_text.parent and wib_text.parent.parent:
            waktu = wib_text.parent.parent.get_text(separator=" ", strip=True).replace("\xa0", " ")
            if "-" in waktu:
                start_time = waktu.split("-")[0].strip()[:5]

        team_element = item.find("span", class_="truncate")
        if team_element:
            tipe_event = team_element.text.strip()
        else:
            special_badge = item.find(lambda tag: tag.name == "div" and "bg-primary" in tag.get("class", []) and "text-white" in tag.get("class", []))
            if special_badge:
                tipe_event = special_badge.text.strip()
            else:
                tipe_event = "Teater"

        bulan_angka = month_map.get(bulan.upper(), "00")
        sort_key = f"{bulan_angka}-{tanggal.zfill(2)} {start_time}"

        location = "Teater JKT48, FX Sudirman" if "teater" in tipe_event.lower() or "team" in tipe_event.lower() or "trainee" in tipe_event.lower() else "Jakarta"

        hasil_jadwal.append({
            "date": tanggal,
            "day": bulan,
            "type": tipe_event,
            "time": waktu,
            "title": title,
            "location": location,
            "_sort_key": sort_key
        })

    hasil_jadwal_urut = sorted(hasil_jadwal, key=lambda x: x["_sort_key"])
    for j in hasil_jadwal_urut:
        del j["_sort_key"]

    if not periode_jadwal or "BULAN" in periode_jadwal:
        periode_jadwal = "September 2026"

    return {
        "periode": periode_jadwal,
        "data": hasil_jadwal_urut
    }

@app.get("/api/jadwal")
def get_jadwal(refresh: bool = False):
    cached = load_cache()

    if refresh or not cached:
        try:
            live_data = scrape_official()
            if live_data and live_data.get("data"):
                save_cache(live_data["data"], live_data.get("periode"))
                return live_data
        except Exception as e:
            logger.error(f"Scraping failed: {e}")

    if cached:
        return cached

    return {"periode": "September 2026", "data": []}

@app.get("/api/members")
def get_members():
    file_json = "members.json"
    
    # 1. Cek file JSON
    if os.path.exists(file_json):
        with open(file_json, "r") as f:
            return {"data": json.load(f)}

    print("INFO: File JSON belum ada. Mulai scraping data member...")
    
    kategori_tim = [
        ("Team Love", "LOVE"),
        ("Team Dream", "DREAM"),
        ("Team Passion", "PASSION"),
        ("Trainee", "TRAINEE"),
        ("JKT48 Virtual", "VIRTUAL")
    ]
    
    hasil_member = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=["--disable-blink-features=AutomationControlled"])
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            print("INFO: Melewati satpam Cloudflare...")
            page.goto("https://jkt48.com/member", wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector('.member-card', timeout=30000) 
            
            for nama_tim, param_tim in kategori_tim:
                print(f"INFO: Sedang menyedot data {nama_tim}...")
                url = f"https://jkt48.com/member?type={param_tim}"
                page.goto(url, wait_until="domcontentloaded")
                
                page.wait_for_timeout(2000) 
                
                html = page.content()
                soup = BeautifulSoup(html, 'html.parser')
                
                kartu_members = soup.find_all('a', class_=lambda c: c and 'member-card' in c)
                
                for kartu in kartu_members:
                    nama_element = kartu.find('p', class_=lambda c: c and 'font-bold' in c)
                    if nama_element:
                        hasil_member.append({
                            "name": nama_element.text.strip(),
                            "team": nama_tim 
                        })
                        
            with open(file_json, "w") as f:
                json.dump(hasil_member, f, indent=4)
            print("INFO: Sukses! Data akurat disimpan ke members.json!")
            
        except Exception as e:
            print(f"Error scraping members: {e}")
        finally:
            browser.close()

    return {"data": hasil_member}