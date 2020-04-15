import time

import clawler
import unit_test
import write_menu_data

startTime = time.time()  # 시작 시간 저장

all_corps_menu = clawler.MenuClawler() # 크롤링하기

print()
unit_test.IsBlankedCorps(all_corps_menu)
try:
    unit_test.IsMenuCorrect(all_corps_menu)
except Exception as ex:  # 에러 종류
    print('unit_test.IsMenuCorrect_유닛 테스트중 에러가 발생 했습니다', ex)  # ex는 발생한 에러의 이름을 받아오는 변수
write_menu_data.writeAllCorpsMenu_TXT(all_corps_menu)
print()
print("WorkingTime: {} sec".format(time.time() - startTime))
print("끝.")