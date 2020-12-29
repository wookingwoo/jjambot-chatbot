from bs4 import BeautifulSoup
import requests
import time

from api_key import *
from write_log import *


def MenuClawler():
    # headers = {'cnotent-type': 'application/json;charset=utf-8'}

    all_corps_menu = {}

    for i in range(len(corps)):
        t = 5

        print()
        write_all_log("corps: " + corps[i])
        
        requests.packages.urllib3.disable_warnings()
        requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
        
        try:
            requests.packages.urllib3.contrib.pyopenssl.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
        except AttributeError:
            # no pyopenssl support used / needed / available
            pass

        response = requests.get(info_url[i], verify=False)
        print("{}초 휴식.".format(t))
        time.sleep(t)
        print("/")

        soup = BeautifulSoup(response.content, 'html.parser')

        print("{}초 휴식.".format(t))
        time.sleep(t)
        print("/")

        menu = {}
        date = "init"

        breakfast = []
        lunch = []
        dinner = []
        specialFood = []

        rows = soup.find_all('row')

        if i == 0:  # 3급양대는 openapi의 제공 형식이 달라 따로 처리 필요

            for row in rows:
                date = row.find('dates').text

                if (not (date == "")) and (not (date in menu.keys())):
                    menu[date] = {"breakfast": [], "lunch": [], "dinner": []}
                    # menu = {날짜:{아침:[], 점심:[], 저녁:[], 부식[]}}
                    print("-----", date, "-----")

                if not (row.find('brst').text == ""):
                    print(date, "(아침):", row.find('brst').text)
                    menu[date]["breakfast"].append(row.find('brst').text)

                if not (row.find('lunc').text == ""):
                    print(date, "(점심):", row.find('lunc').text)
                    menu[date]["lunch"].append(row.find('lunc').text)

                if not (row.find('dinr').text == ""):
                    print(date, "(저녁):", row.find('dinr').text)
                    menu[date]["dinner"].append(row.find('dinr').text)




        else:
            for row in rows:
                if not (row.find('dates').text == ""):

                    if not (date == "init"):
                        print("날짜 있음")

                        try:
                            if (len(date) == 10) and (date[4] == "-") and (date[7] == "-") and (
                                    int(date[0:4]) >= 2000) and (
                                    int(date[0:4]) <= 3000) and (int(date[5:7]) >= 1) and (
                                    int(date[5:7]) <= 12) and (int(date[8:10]) >= 1) and (int(date[8:10]) <= 31):
                                print("YYYY-DD-MM 날짜 구조 (신 날짜 구조, 2020년 9월 이후)")
                                date = date[0:4] + date[5:7] + date[8:10]
                                menu[date] = {"breakfast": breakfast, "lunch": lunch, "dinner": dinner,
                                              "specialFood": specialFood}

                            elif (len(str(date)) == 8) and (int(date[0:4]) >= 2000) and (
                                    int(date[0:4]) <= 3000) and (int(date[4:6]) >= 1) and (
                                    int(date[4:6]) <= 12) and (int(date[6:8]) >= 1) and (int(date[6:8]) <= 31):
                                print("YYYYDDMM 날짜 구조 (구 날짜 구조, 2020년 9월 이전)")

                            else:
                                print("날짜 해석 불가")
                        except Exception as e:
                            print('날짜 해석 중 에러가 발생 했습니다:', e)

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
    return all_corps_menu
