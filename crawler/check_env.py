import os


# 경로가 존재하지 않으면 새로 생성
def check_dir(dir):
    if not os.path.isdir(dir):
        os.mkdir(dir)
        print(dir + "경로가 없어 새로 생성 했습니다.")