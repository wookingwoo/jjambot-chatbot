# jjambot


nvm 설치


1) 관련 패키지 설치하기
ubuntu에 nvm을 설치하기 위해, apt를 이용하여 설치하고자 합니다. npm 및 nodejs 관련 모듈을 설치하기 위해, apt로 다음과 같은 모듈을 먼저 설치합니다.

sudo apt-get install build-essential libssl-dev
2) nvm 설치
curl을 이용하여 nvm을 설치합니다. (command에 나온 버전은 0.33.11 버전입니다.)

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

<최신버전>
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash


3) bashrc를 통해 적용
bashrc를 업데이트 합니다.

source ~/.bashrc
4) nvm 설치 확인
nvm이 정상적으로 설치되었는지를 확인해보기 위해서, nvm version을 확인해 봅니다.

nvm --version
> 0.33.11
nvm 버전이 정상적으로 출력되면 설치가 완료된 것입니다.


