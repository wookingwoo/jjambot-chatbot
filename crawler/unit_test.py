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


def IsMenuCorrect(dic):
    right = 0
    wrong = 0

    print()
    print("************")
    print("데이터 비교 테스트")

    if dic["ATC"]["20200322"] == {'breakfast': ['떡만둣국 (1)(5)(6)(10)(16)', '쇠고기호박볶음 (5)(6)(9)(16)', '배추김치(3~4월)'],
                                  'lunch': ['밥', '감자국 (5)', '돼지고기고추장볶음 (5)(6)(10)', '양배추쌈/쌈장 (5)(6)', '배추김치(3~4월)'],
                                  'dinner': ['비빔밥 (5)(6)(16)', '팽이버섯된장국 (5)(6)', '삶은달걀 (1)', '배추김치(3~4월)'],
                                  'specialFood': ['백색우유(200ml) (2)', '과일젤리']}:
        right += 1
    else:
        wrong += 1
        print("육훈소 20200322 데이터 오류.")

    if dic["5322"]["20200416"] == {'breakfast': ['밥1', '생선묵국 (5)(6)(9)', '돼지고기김치볶음 (6)(10)', '맛김'],
                                   'lunch': ['잡곡밥', '북어채국 (1)(5)(9)(18)', '오징어볶음 (5)(6)(17)', '깐풍기 (1)(5)(6)(15)',
                                             '배추김치(3~4월)'],
                                   'dinner': ['잡곡밥', '닭고기육개장 (1)(5)(15)', '카레떡볶이 (10)', '야채튀김 (6)', '깍두기(임가공)'],
                                   'specialFood': ['우유(백색우유(200ML,연간)) (2)', '레몬에이드', '요구르트,떠먹는형 (2)']}:
        right += 1
    else:
        wrong += 1
        print("5322부대(1급양대) 20200416 데이터 오류.")

    print()
    print("성공 횟수: {}/{}".format(right, right + wrong))
    print("************")
