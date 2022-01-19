import os

l = []


def print_files_in_dir(root_dir, prefix):
    files = os.listdir(root_dir)
    for file in files:
        path = os.path.join(root_dir, file)
        path = path.replace("\\", "/")  # \를 /로 변환

        # print(prefix + path)
        l.append(prefix + path)
        if os.path.isdir(path):
            # print_files_in_dir(path, prefix + "    ")
            print_files_in_dir(path, prefix)

    # print(l)


if __name__ == "__main__":
    path = "./sort_menuData"
    print_files_in_dir(path, "")

    print(l)

    new_list = []
    for v in l:
        if v not in new_list:
            # print(v[-4:])
            if v[-4:] == ".txt":
                if "예시" not in v:
                    if "알레" not in v:
                        if "테스트" not in v:
                            new_list.append(v)

    print(new_list)
