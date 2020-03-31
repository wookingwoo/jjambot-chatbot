# 파이썬 메뉴 크롤러

from api_key import *


from bs4 import BeautifulSoup
import requests
import datetime
import json




info_url = HOST+"/"+KEY+"/"+TYPE+"/"+SERVICE+"/"+START_INDEX+"/"+END_INDEX
response = requests.get(info_url)
soup = BeautifulSoup(response.content, 'html.parser')

rows = soup.find_all('row')

for row in rows:
    print(row.find('dates').text, ":", row.find('brst').text)