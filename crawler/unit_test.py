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

            if blankedCorps[i] == "3296":
                print(blankedCorps[i], end='')
                print(" (api 준비중인 부대)")
            else:
                print(blankedCorps[i])

        print()
        print("갯수:", len(blankedCorps))
        print("******************************")
