import os


def writeAllCorpsMenu_TXT(dic_parsing_menu):
    import copy
    import datetime

    # 기존 메뉴 불러오기
    f = open("./crawling_data/allCorpsMenu.txt", 'r')
    dic_all_menu_file = eval(f.read())
    f.close()

    # 변동사항 확인하기 위해 dic_all_menu_old로 깊은 복사하여 백업.
    dic_all_menu_old = copy.deepcopy(dic_all_menu_file)

    # 크롤링한 메뉴를 기존 메뉴에 추가해 새로 파일 쓰기
    dic_all_menu_file.update(dic_parsing_menu)
    print("크롤링한 데이터를 업데이트 했습니다.")
    f = open("./crawling_data/allCorpsMenu.txt", 'w')
    f.write(str(dic_all_menu_file))
    f.close()
    print("./crawling_data/allCorpsMenu.txt에 파일 쓰기 완료.")

    # 변동사항 로그 기록.
    if dic_all_menu_file == dic_all_menu_old:
        print("기존 DB(allCorpsMenu.txt)의 변동사항이 없습니다.")
    else:
        print("\n***********기존 DB(allCorpsMenu.txt)가 새롭게 변경되었습니다!!!***********")
        keys = "(업데이트메뉴) 차집합 (기존메뉴) [keys]: >>" + str(set(dic_all_menu_file.keys()) - set(dic_all_menu_old.keys()))
        # values = "(업데이트메뉴) 차집합 (기존메뉴) [values]: >>" + str(set(dic_all_menu_file.values()) - set(dic_all_menu_old.values()))
        print(keys)
        # print(values)
        print("********************************************\n")

        # 경로가 존재하지 않으면 새로 생성
        if not os.path.isdir("./log_data"):
            os.mkdir("./log_data")
            print("./log_data" + " 경로가 없어 새로 생성 했습니다.")

        # 파일이 존재하지 않을 경우 빈 파일 생성
        # if not os.path.exists("./log_data/change_log.txt"):
        #     f = open("./log_data/change_log.txt", 'w')
        #     f.write("")
        #     f.close()
        #     print("./log_data/change_log.txt" + " 파일이 없어 새로 생성합니다.")

        file_change_DB_log = open("./log_data/change_log.txt", 'a')
        file_change_DB_log.writelines(str(datetime.datetime.now()) + ": " + "기존 DB가 새롭게 변경되었습니다." + "\n")
        file_change_DB_log.writelines(keys + "\n")
        # file_change_DB_log.writelines(values + "\n" + "\n")
        file_change_DB_log.close()

        print("\'{}\'에 DB의 변동사항을 기록했습니다.".format("./log_data/change_log.txt"))


def writeMenuAsDate_TXT(dic):
    import pickle

    # {
    #     '부대': {'날짜': {'breakfast': ['메뉴1', '메뉴2'], 'lunch': ['메뉴1', '메뉴2'], 'dinner': ['메뉴1', '메뉴2'],
    #                   'specialFood': ['메뉴1', '메뉴2']}, ...}
    #
    #         ...
    #
    # }

    # y: '부대'
    #  z: '날짜'
    for y in sorted(dic):

        for z in sorted(dic[y]):
            path_classify_dir = './crawling_data/sort_menuData'
            path_classify_corps = './crawling_data/sort_menuData/{}'.format(y)
            path_classify_dir_year = './crawling_data/sort_menuData/{}/year_{}'.format(y, z[0:4])
            path_classify_dir_month = './crawling_data/sort_menuData/{}/year_{}/month_{}'.format(y, z[0:4], z[4:6])
            path_classify = './crawling_data/sort_menuData/{}/year_{}/month_{}/{}_menu.txt'.format(y, z[0:4], z[4:6],
                                                                                                   z[0:4] + "_" + z[
                                                                                                                  4:6])

            # 경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir):
                os.mkdir(path_classify_dir)
                print(path_classify_dir + "경로가 없어 새로 생성 했습니다.")

                # 경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_corps):
                os.mkdir(path_classify_corps)
                print(path_classify_corps + "경로가 없어 새로 생성 했습니다.")

            # 경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir_year):
                os.mkdir(path_classify_dir_year)
                print(path_classify_dir_year + "경로가 없어 새로 생성 했습니다.")

            # 경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir_month):
                os.mkdir(path_classify_dir_month)
                print(path_classify_dir_month + "경로가 없어 새로 생성 했습니다.")

            # 파일이 존재하지 않을 경우 빈 파일 생성
            if not os.path.exists(path_classify):
                blank_dic = {}
                f = open(path_classify, 'w')
                f.write(str(blank_dic))
                f.close()
                print(path_classify + "파일이 없어 새로 생성합니다.")

            # 날짜별로 분류된 .dat 파일의 딕셔너리를 classified_dic로 저장
            f = open(path_classify, 'r')
            classified_dic = eval(f.read())
            f.close()

            # if key y exists in classified_dic?
            if not y in classified_dic:
                print(y, "키가 존재하기 않아 추가했습니다.")
                classified_dic[y] = {}

            classified_dic[y][z] = dic[y][z]

            # 새로 .dat에 저장
            file_classified_dic_new = open(path_classify, 'w')
            file_classified_dic_new.write(str(classified_dic))
            file_classified_dic_new.close()
            print(path_classify + "분류 저장 완료")

    print("DB를 날짜별로 분류해 저장하였습니다.")


if __name__ == "__main__":
    # dic = {"test": "test_value"}

    f = open("./crawling_data/allCorpsMenu.txt", 'r')
    data = f.read()
    f.close()
    dic = eval(data)
    # print("dic 타입:", type(dic))
    # print("dic:", dic)

    dic = writeMenuAsDate_TXT(dic)
