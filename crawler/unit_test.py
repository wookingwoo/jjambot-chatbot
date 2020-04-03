def IsBlankedCorps(dic):
    ifAnyoneBlanked = False
    blankedCorps = []

    for key, value in dic.items():

        if value == {}:
            ifAnyoneBlanked = True

            blankedCorps.append(key)

    if ifAnyoneBlanked:
        print()
        print("************ 오류 ************")
        print("아래의 값이 비었습니다.")
        for i in range(len(blankedCorps)):
            print(blankedCorps[i])
        print()
        print("갯수:", len(blankedCorps))
        print("******************************")
