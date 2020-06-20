# jjambot (짬봇)



## 설치 안내 (Installation Process)

### nvm 설치

- 관련 패키지 설치하기

npm 및 nodejs 관련 모듈을 설치하기 위해 apt로 다음과 같은 모듈을 먼저 설치합니다.

```bash
$ sudo apt-get install build-essential libssl-dev
```


- nvm 설치

curl을 이용하여 nvm을 설치합니다. (0.35.3 버전 기준)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Information.

	[리눅스] https://github.com/creationix/nvm#installation
	[윈도우] https://github.com/coreybutler/nvm-windows


- bashrc를 통해 적용

bashrc를 업데이트 합니다. 

```bash
$ source ~/.bashrc
```

- nvm 설치 확인

nvm이 정상적으로 설치되었는지를 확인해보기 위해서, nvm version을 확인해 봅니다.

```bash
$ nvm --version
```

	예시: 0.35.3


---

### nodejs 설치

- nodejs 설치

nvm 설치 후 nodejs를 설치 할 수 있습니다.

lts(long term support) 버전으로 설치하겠습니다.


```bash
$ nvm install --lts
```

- node의 설치 확인

node가 정상적으로 설치되었는지 node 버전을 확인해봅니다.

```bash
$ node -v
```

	예시: v10.13.0


---



### expressjs 설치

- expressjs 설치

nodejs에서 가장 많이 사용되는 웹 프레임워크이며. 간단한 코드로 높은 성능을 낼 수 있으며 다양한 기능을 가진 웹 서버를 생성할 수 있습니다.


```bash
$ npm i --save express
```

- morgan, body-parser 라이브러리를 추가

morgan은 로깅을 담당하고 body-parser는 http 요청의 body를 추출합니다.


```bash
$ npm i --save morgan body-parser
```



---


### JS 추가 모듈 설치

- xml-js

XML to JSON converters


```bash
$ npm install --save xml-js
```


- request



```bash
$ npm install request
```


- moment

해외 서버를 구축하는 경우, new date()로 시간 설정 시 한국 시간이 표시되지 않는 현상이 있습니다. 이를 대비해 moment를 이용하였습니다.



```bash
$ npm install moment
```


```bash
$ npm install moment-timezone
```



- sf

String formatting library for node.js. [개발문서](https://www.npmjs.com/package/sf)



```bash
$ npm install sf
```



---


### POST TEST

- curl

curl 테스트 예시입니다.

```bash
$ curl https://domain/api/menu \
-X POST \
-H "Content-type: application/json" \
-d '{"key1": "value1", "key2": "value2"}'
```




---

### python 추가 모듈 설치

- pip

pip란 파이썬으로 작성된 다양한 패키지 라이브러리를 관리해주는 시스템입니다.

파이썬 관련 라이브러리를 설치하거나 제거하는 역할을 합니다.

```bash
sudo apt-get install python3-pip 
```

- bs4

```bash
pip3 install beautifulsoup4
```


---


## Linux Setting

### TimeZone

한국 표준시로 변경하는 2가지 방법입니다.


- Timezone 변경하기 1


현재 시간을 확인하는 명령어로 우분투 시스템에서 사용하는 표준 시간을 보여줍니다.

```bash
$ date
```

다음 명령어를 입력 후 원하는 시간대 국가를 선택하세요.
```bash
$ tzselect
```

아래와 같이 오류가 난다면 직접 추가해야합니다. (Timezone 변경하기 2 참고.)

```
You can make this change permanent for yourself by appending the line
        TZ='Asia/Seoul'; export TZ
to the file '.profile' in your home directory; then log out and log in again.

Here is that TZ value again, this time on standard output so that you
can use the /usr/bin/tzselect command in shell scripts:
```


- Timezone 변경하기 2

아래는 Timezone을 직접 변경하는 법입니다.

아래 나온 설정 지역 예시는 Asia/Seoul입니다.
```bash
$ sudo ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
```



---



## Data

### 형식

- user_data.txt

부대 정보, 알러지 정보, 전역일등 사용자 데이터를 저장하는 DB로 JSON형식으로 저장됩니다.


```
{
"sample_id":{
"alias":"sample",
"corps":"5322",
"allergy_show":"on",
"date_to_join_the_army":"2018-12-17",
"discharge_date":"2020-07-27",
"jjambot_join_date":"2020-06-20 15:39:37",
"usage_count":{"total":47,"menu_api":5,"all_corps_menu_api":1,"allergy_onoff_api":1,"change_corps_api":1,"change_join_army_date":6,"change_discharge_date":5,"calculate_date":28}},

...

}

```

- allCorpsMenu.txt

크롤링된 데이터는 아래와같은 JSON형식의 txt로 저장됩니다.

```
{
'부대': {'날짜': {'breakfast': ['메뉴1', '메뉴2'], 'lunch': ['메뉴1', '메뉴2'], 'dinner':['메뉴1', '메뉴2'], 'specialFood': ['메뉴1', '메뉴2']},    ...   }

...

}

```


---


## 서버 실행 방법

### chatbot server (node.js)

index.js를 실행시키는 방법입니다.

```bash
$ node index.js
```

- forever

node.js는 한번 오류가 생기면 서버가 종료되어집니다. forever 명령어를 사용하게 되면 에러 발생 시 서버가 중지되지 않고 프로그램을 자동으로 다시 실행시켜줍니다.


forever 설치 방법입니다.
```bash
$ npm install forever -g
```

forever 시작 방법입니다.

-w란 watch의 약자이며, 소스코드의 변경이 감지되면 자동으로 node 서버를 재시작 해줍니다.

```bash
$ forever start index.js
```


동작중인 forever 리스트 확인하는 방법입니다.

```bash
forever list
```

실시간 로그 확인 (tail -f log파일위치)

```bash
$ tail -f [로그파일 경로]
```


forever 중지 하는 방법입니다.

```bash
$ forever stop index.js
```

forever 재시작 하는 방법입니다.

```bash
$ forever restart index.js
```


forever --help를 통해 명령어들을 확인할 수 있습니다. 

```bash
$ forever --help
```


### crawler server

- nohup

nohup을 이용하면 터미널을 종료시킨 후에도 프로세스를 계속해서 진행시킬 수 있습니다.

```bash
$ nohup python3 run_server.py &
```

nohup으로 작업할 파일은 755 이상의 권한이 필요합니다.

```bash
$ chmod 755 shell.sh
```

- ps와 kill


해당 프로세스를 종료하고자 할 때에는 ps 명령어와 kill 명령어로 종료할 수 있습니다.

먼저 ps 명령어를 이용해 pid를 확인합니다.

```bash
$ ps -ef | grep [스트립트 / 또는 명령어]
```

해당 프로세스 아이디(PID)를 아래와 같이 kill 하면 프로세스가 종료됩니다.

```bash
$ kill -9 [PID]
```


## 참고자료

https://i.kakao.com/docs/skill-build#%EC%98%88%EC%A0%9C-%EC%8A%A4%ED%82%AC-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0

