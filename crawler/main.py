import time

import clawler
import unit_test
import write_menu_data

startTime = time.time()  # 시작 시간 저장

all_corps_menu = clawler.MenuClawler() # 크롤링하기

print()
unit_test.IsBlankedCorps(all_corps_menu) # 메뉴가 빈 부대 있는지 유닛테스트 진행
try:
    unit_test.IsMenuCorrect(all_corps_menu) # 샘플 메뉴와 비교하여 정상적으로 크롤링 되었는지 유닛테스트 진행
except Exception as ex:  # 에러 종류
    print('unit_test.IsMenuCorrect_유닛 테스트중 에러가 발생 했습니다', ex)  # ex는 발생한 에러의 이름을 받아오는 변수
write_menu_data.writeAllCorpsMenu_TXT(all_corps_menu) # 전부대 전메뉴를 allCorpsMenu.txt에 저장
print()
print("WorkingTime: {} sec".format(time.time() - startTime)) # 크롤링 시간 계산 후 출력
print("끝.")