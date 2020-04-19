def writeAllCorpsMenu_TXT(dic):
    f = open("./crawling_data/allCorpsMenu.txt", 'w')
    f.write(str(dic))
    f.close()
    print("./crawling_data/allCorpsMenu.txt에 파일 쓰기 완료.")


def writeMenuAsDate_TXT(dic):
    import os
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
            path_classify_dir_year = './crawling_data/sort_menuData/year_{}'.format(z[0:4])
            path_classify_dir_month = './crawling_data/sort_menuData/year_{}/month_{}'.format(z[0:4], z[4:6])
            path_classify = './crawling_data/sort_menuData/year_{}/month_{}/{}_menu.dat'.format(z[0:4], z[4:6],
                                                                                                z[0:4] + "_" + z[4:6])

            #                   경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir):
                os.mkdir(path_classify_dir)
                print(path_classify_dir + "경로가 없어 새로 생성 했습니다.")

            #                   경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir_year):
                os.mkdir(path_classify_dir_year)
                print(path_classify_dir_year + "경로가 없어 새로 생성 했습니다.")

            #                   경로가 존재하지 않으면 새로 생성
            if not os.path.isdir(path_classify_dir_month):
                os.mkdir(path_classify_dir_month)
                print(path_classify_dir_month + "경로가 없어 새로 생성 했습니다.")

            #                 파일이 존재하지 않을 경우 빈 파일 생성
            if not os.path.exists(path_classify):
                blank_dic = {}
                f = open(path_classify, 'w')
                f.write(str(blank_dic))
                f.close()
                print(path_classify + "파일이 없어 새로 생성합니다.")

            # #                 날짜별로 분류된 .dat 파일의 딕셔너리를 classified_dic로 저장
            # file_classified_dic_old = open(path_classify, 'rb')
            # classified_dic = pickle.load(file_classified_dic_old)
            # file_classified_dic_old.close()
            #
            # classified_dic[y] = dic[y]
            #
            # #                 새로 .dat에 저장
            # file_classified_dic_new = open(path_classify, 'wb')
            # pickle.dump(classified_dic, file_classified_dic_new)
            # file_classified_dic_new.close()

    print("DB를 날짜별로 분류해 저장하였습니다.")


if __name__ == "__main__":
    # dic = {"test": "test_value"}

    f = open("./crawling_data/allCorpsMenu.txt", 'r')
    data = f.read()
    f.close()
    dic = eval(data)
    print("dic 타입:", type(dic))
    print("dic:", dic)

    dic = writeMenuAsDate_TXT(dic)
