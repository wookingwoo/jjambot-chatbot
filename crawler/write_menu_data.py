def writeAllCorpsMenu_TXT(dic):
    f = open("./crawling_data/allCorpsMenu.txt", 'w')
    f.write(str(dic))
    f.close()
    print("./crawling_data/allCorpsMenu.txt에 파일 쓰기 완료.")
