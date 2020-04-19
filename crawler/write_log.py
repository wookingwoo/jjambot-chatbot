import os
import datetime


def write_all_log(s):
    now = datetime.datetime.now()

    year = str(now.year)

    if now.month < 10:
        month = "0" + str(now.month)
    else:
        month = str(now.month)

    if now.day < 10:
        day = "0" + str(now.day)
    else:
        day = str(now.day)

    d1 = "./log_data"
    d2 = './log_data/sort_log'
    d3 = './log_data/sort_log/year_{}'.format(year)
    d4 = './log_data/sort_log/year_{}/month_{}'.format(year, month)
    d5 = './log_data/sort_log/year_{}/month_{}/{}_all_log.txt'.format(year, month, year + month + day)
    # 경로가 존재하지 않으면 새로 생성
    if not os.path.isdir(d1):
        os.mkdir(d1)
        print(d1, "경로가 없어 새로 생성 했습니다.")

    # 경로가 존재하지 않으면 새로 생성
    if not os.path.isdir(d2):
        os.mkdir(d2)
        print(d2, "경로가 없어 새로 생성 했습니다.")

    # 경로가 존재하지 않으면 새로 생성
    if not os.path.isdir(d3):
        os.mkdir(d3)
        print(d3, "경로가 없어 새로 생성 했습니다.")

    # 경로가 존재하지 않으면 새로 생성
    if not os.path.isdir(d4):
        os.mkdir(d4)
        print(d4, "경로가 없어 새로 생성 했습니다.")

    # 로그 작성
    f = open(d5, 'a')
    f.writelines(str(datetime.datetime.now()) + ": " + s + "\n")
    f.close()

    print(str(datetime.datetime.now()) + ": " + s)  # 콘솔에도 출력
