from bs4 import BeautifulSoup
import requests
import time

from data.api_key import *
import unit_test
import write_menu_data

startTime = time.time()  # 시작 시간 저장

# headers = {'cnotent-type': 'application/json;charset=utf-8'}


all_corps_menu = {}

for i in range(len(corps)):

    if i == 0:
        pass
    # 3급양대는 openapi의 제공 형식이 달라 따로 처리 필요

    else:
        print()
        print("corps:", corps[i])

        response = requests.get(info_url[i])
        print("0.5초 휴식.", end="")
        time.sleep(0.5)
        print("/")

        soup = BeautifulSoup(response.content, 'html.parser')

        print("0.5초 휴식.", end="")
        time.sleep(0.5)
        print("/")

        menu = {}
        date = "init"

        breakfast = []
        lunch = []
        dinner = []
        specialFood = []

        rows = soup.find_all('row')

        for row in rows:
            if not (row.find('dates').text == ""):

                if not (date == "init"):
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
        print("menu:", menu)

        all_corps_menu[corps[i]] = menu

print()
print("all_corps_menu:", all_corps_menu)
print()
unit_test.IsBlankedCorps(all_corps_menu)
unit_test.IsMenuCorrect(all_corps_menu)
write_menu_data.writeAllCorpsMenu_TXT(all_corps_menu)
print()
print("WorkingTime: {} sec".format(time.time() - startTime))
print("끝.")
