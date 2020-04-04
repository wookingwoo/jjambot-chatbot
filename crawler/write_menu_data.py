def writeAllCorpsMenu_TXT(dic):
    f = open("./data/allCorpsMenu.txt", 'w')
    f.write(str(dic))
    f.close()
    print("./data/allCorpsMenu.txt에 파일 쓰기 완료.")
