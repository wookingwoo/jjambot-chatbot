from api_key import *

from bs4 import BeautifulSoup
import requests

info_url = HOST + "/" + KEY + "/" + TYPE + "/" + SERVICE + "/" + START_INDEX + "/" + END_INDEX
response = requests.get(info_url)
soup = BeautifulSoup(response.content, 'html.parser')

menu = {}
date = ""

rows = soup.find_all('row')

for row in rows:
    if not (row.find('dates').text == ""):

        if not (date == ""):
            menu[date] = {"breakfast": breakfast, "lunch": lunch, "dinner": dinner, "specialFood": specialFood}
        # menu = {날짜:{아침:[], 점심:[], 저녁:[], 부식[]}}

        date = row.find('dates').text
        print("-----", date, "-----")
        breakfast = []
        lunch = []
        dinner = []
        specialFood = []

    if not (row.find('brst').text == ""):
        print(date, "(아침):", row.find('brst').text)
        breakfast.append(row.find('brst').text)

    if not (row.find('lunc').text == ""):
        print(date, "(점심):", row.find('lunc').text)
        lunch.append(row.find('lunc').text)

    if not (row.find('dinr').text == ""):
        print(date, "(저녁):", row.find('dinr').text)
        dinner.append(row.find('dinr').text)

    if not (row.find('adspcfd').text == ""):
        print(date, "(부식):", row.find('adspcfd').text)
        specialFood.append(row.find('adspcfd').text)

print()
print(menu)
