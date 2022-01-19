from bs4 import BeautifulSoup
import requests
import time

from data.mnd_api_key import corps, api_url
from write_log import write_all_log


def menu_crawler():
    # headers = {'cnotent-type': 'application/json;charset=utf-8'}

    t = 5
    all_corps_menu = {}

    for _corps in corps:

        print()
        write_all_log("corps: " + _corps)

        requests.packages.urllib3.disable_warnings()
        requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'

        try:
            requests.packages.urllib3.contrib.pyopenssl.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
        except AttributeError:
            # no pyopenssl support used / needed / available
            pass

        response = requests.get(api_url[_corps], verify=False)
        print("{}초 휴식.".format(t), end="")
        time.sleep(t)
        print("/")

        soup = BeautifulSoup(response.content, 'html.parser')

        print("{}초 휴식.".format(t), end="")
        time.sleep(t)
        print("/")

        menu = {}

        rows = soup.find_all('row')

        for row in rows:
            if not (row.find('dates').text == ""):
                date = row.find('dates').text

                if date is not None:
                    print("날짜 있음")
                    my_date_code = None

                    try:

                        if (len(date) == 10) and (date[4] == "-") and (date[7] == "-") and (
                                int(date[0:4]) >= 2000) and (
                                int(date[0:4]) <= 3000) and (int(date[5:7]) >= 1) and (
                                int(date[5:7]) <= 12) and (int(date[8:10]) >= 1) and (int(date[8:10]) <= 31):
                            print("YYYY-DD-MM 날짜 구조 (신 날짜 구조, 2020년 9월 이후)")

                            my_date_code = date[0:4] + date[5:7] + date[8:10]






                        elif (len(str(date)) == 8) and (int(date[0:4]) >= 2000) and (
                                int(date[0:4]) <= 3000) and (int(date[4:6]) >= 1) and (
                                int(date[4:6]) <= 12) and (int(date[6:8]) >= 1) and (int(date[6:8]) <= 31):
                            print("YYYYDDMM 날짜 구조 (구 날짜 구조, 2020년 9월 이전)")

                            my_date_code = date


                        else:
                            print("날짜 해석 불가")


                    except Exception as e:
                        print('날짜 해석 중 에러가 발생 했습니다:', e)

                    if my_date_code is not None:

                        if my_date_code in menu:
                            pass
                        else:
                            menu[my_date_code] = {"breakfast": [], "lunch": [], "dinner": [], "special_food": []}

                        # menu = {날짜:{아침:[], 점심:[], 저녁:[], 부식[]}}

                        print("-----", date, "-----")

                        if row.find('brst') is not None:
                            if not (row.find('brst').text == ""):
                                print(date, "(아침):", row.find('brst').text)
                                menu[my_date_code]["breakfast"].append(row.find('brst').text)

                        if row.find('lunc') is not None:
                            if not (row.find('lunc').text == ""):
                                print(date, "(점심):", row.find('lunc').text)
                                menu[my_date_code]["lunch"].append(row.find('lunc').text)

                        if row.find('dinr') is not None:
                            if not (row.find('dinr').text == ""):
                                print(date, "(저녁):", row.find('dinr').text)
                                menu[my_date_code]["dinner"].append(row.find('dinr').text)

                        try:
                            if row.find('adspcfd') is not None:
                                if not (row.find('adspcfd').text == ""):
                                    print(date, "(부식):", row.find('adspcfd').text)
                                    menu[my_date_code]["special_food"].append(row.find('adspcfd').text)

                        except Exception as e:
                            error = str(e)
                            write_all_log("\n\n\t***부식 크롤링 중 에러 발생")
                            write_all_log(error + "\n")

        print()
        print("menu:", menu)

        all_corps_menu[_corps] = menu

    print()
    print("all_corps_menu:", all_corps_menu)
    return all_corps_menu


# {'5322': {'20180712': {'breakfast': ['콩나물국 (5)', '생선묵볶음 (5)(6)', '배추김치(7~9월)', '감자밥'], 'lunch': ['북어채국 (1)(5)(9)', '두부김치 (5)(10)', '오징어야채무침 (5)(6)(17)', '총각김치', '밥'], 'dinner': ['감자양파찌개 (5)(6)(10)', '파닭(파채닭튀김) (1)(5)(6)(15)', '무초절이', '배추김치(7~9월)', '잡곡밥']}, '20180713': {'breakfast': ['밥1', ...


if __name__ == "__main__":
    menu_crawler()
