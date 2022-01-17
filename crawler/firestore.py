import datetime

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from write_log import write_all_log

fb_cred = credentials.Certificate("./data/firebase_key.json")
firebase_admin.initialize_app(fb_cred, {
    'projectId': 'jjambot-916ef',
})

fb_db = firestore.client()


## 데이터 추가: .set
## 데이터 업데이트: .update (document가 존재하지 않을경우 오류)
## 데이터 추가 + merge: 업데이트 가능
# fb_ref_test = fb_db.collection('test1-1').document('test1-2').collection('test1-3').document('test1-4')
# fb_ref_test.set({
#     'test1': 1,
#     'test2': 2,
#     'test3': "test3"
# }, merge=True)


# firestore에 식단 저장
def store_menu_firestore(corps_menu, start_date_interval=31 * 2):
    now = datetime.datetime.now()
    # print("현재 :", now)  # 현재 : 2022-01-17 20:49:01.115544

    day_before = now - datetime.timedelta(days=start_date_interval)
    # print(f"{start_date_interval}일 전 :", day_before)  # 31*3일 전 : 2021-10-16 20:49:01.115544

    str_start_date = day_before.strftime("%Y%m%d")
    print(f"str_start_date: {str_start_date}")
    # print(type(str_start_date))

    try:

        for corps in corps_menu:

            for date_code in corps_menu[corps]:

                if int(date_code) >= int(str_start_date):
                    fb_ref_menu = fb_db.collection('menu').document(corps).collection(
                        f'year_{date_code[0:4]}').document(f'month_{date_code[4:6]}')
                    fb_ref_menu.set({date_code: corps_menu[corps][date_code]}, merge=True)

    except Exception as e:
        error = str(e)
        write_all_log("\n\n\t***firestore에 식단 저장 중 에러 발생")
        write_all_log(error + "\n")


if __name__ == "__main__":
    test_menu = {'5322': {
        '20210126': {'breakfast': ['맛김', '과일1(02)', '깍두기(임가공)', '밥1', '생선묵국(05)(06)', '돼지고기김치볶음(06)(10)'],
                     'lunch': ['김장김치(12~2월)(09)', '감귤', '스파게티(06)(09)(12)', '오징어튀김(01)(05)(06)', '오이양파장아찌(05)(06)'],
                     'dinner': ['콩나물매운무침(05)', '김장김치(12~2월)(09)', '레몬에이드', '잡곡밥', '순두부찌개(01)(05)(10)(18)',
                                '치킨너겟강정(01)(06)(15)'], 'special_food': []}, '20210127': {
            'breakfast': ['밥1', '쇠고기무국(05)(16)', '새송이버섯야채볶음(05)(06)(10)', '무나물M582:오이무침대', '김장김치(12~2월)(09)',
                          '우유(백색우유(200ML,연간))(02)'],
            'lunch': ['영양밥(05)(06)(16)', '버섯된장찌개(05)(06)', '꽈리고추멸치볶음', '김장김치(12~2월)(09)', '유산균 발효 음료(02)'],
            'dinner': ['잡채볶음밥(05)(06)(10)', '계란국(01)(05)', '치킨너겟(01)(05)(06)(15)', '김장김치(12~2월)(09)'],
            'special_food': []}}}
    store_menu_firestore(corps_menu=test_menu, start_date_interval=31 * 16)
