import random
import main
import time
from write_log import *

repeat_time = 0

while (True):

    try:
        repeat_time += 1
        write_all_log(str(repeat_time) + "회째 실행!")

        main.main()  # main.py 실행

        # write_all_log("테스트 위해 3초만 휴식..")
        # time.sleep(3)
        write_all_log("1시간 휴식..")
        time.sleep(60 * 60)
        write_all_log("/")

        now = time.localtime()
        print("현재 시각: %04d/%02d/%02d %02d:%02d:%02d" % (
            now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec))


        peak_time_list = [6, 7, 10, 11, 16, 17]

        if now.tm_hour in peak_time_list:
            print("peak time 입니다.")
            print("최대 15시간 이내에 크롤링을 새로 실시합니다.")

            random_time_sleep = random.randrange(60 * 60 *15)
            # random_time_sleep = 3
            # write_all_log("테스트 위해 3초만 휴식..")

        else:
            print("peak time이 아니므로 최대 24시간 이내로 크롤링을 다시 시작합니다.")
            random_time_sleep = random.randrange(60 * 60 * 24)
            # random_time_sleep = 3
            # write_all_log("테스트 위해 3초만 휴식..")

        if random_time_sleep < 60:
            print(str(random_time_sleep) + "초 추가로 휴식.. (랜덤 결과)")
        elifrandom_time_sleep < 60*60:
            print(str(random_time_sleep // 60) + "분 " + str(random_time_sleep % 60) + "초 추가로 휴식.. (랜덤 결과)")
        else:
            print(str(random_time_sleep // (60*60)) + "시간 " + str(random_time_sleep // 60) + "분 " + str(random_time_sleep % 60) + "초 추가로 휴식.. (랜덤 결과)")
            

        time.sleep(random_time_sleep)
        write_all_log("/")
        write_all_log("끝.")
        write_all_log("\n====================================================")
        write_all_log("====================================================\n")


    except Exception as e:
        error = str(e)
        write_all_log("\n\n\t***에러가 발생하였습니다ㅠㅠ")
        write_all_log(error + "\n")

        random_time_sleep = random.randrange(60 * 60 * 15)
        if random_time_sleep < 60:
            print(str(random_time_sleep) + "초 추가로 휴식.. (랜덤 결과)-에러휴식")
        elifrandom_time_sleep < 60*60:
            print(str(random_time_sleep // 60) + "분 " + str(random_time_sleep % 60) + "초 추가로 휴식.. (랜덤 결과)-에러휴식")
        else:
            print(str(random_time_sleep // (60*60)) + "시간 " + str(random_time_sleep // 60) + "분 " + str(random_time_sleep % 60) + "초 추가로 휴식.. (랜덤 결과)-에러휴식")
            

        time.sleep(random_time_sleep)
        write_all_log("/")
