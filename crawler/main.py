from api_key import *


from bs4 import BeautifulSoup
import requests
import datetime
import json




info_url = HOST+"/"+KEY+"/"+TYPE+"/"+SERVICE+"/"+START_INDEX+"/"+END_INDEX
response = requests.get(info_url)
soup = BeautifulSoup(response.content, 'html.parser')

rows = soup.find_all('row')


for row in rows:
	if not (row.find('dates').text == ""):
		date =row.find('dates').text
		
	if not (row.find('brst').text==""):
		print(date, "(아침):", row.find('brst').text)
		
	if not (row.find('lunc').text==""):
		print(date, "(점심):", row.find('lunc').text)
		
	if not (row.find('dinr').text==""):
		print(date, "(저녁):", row.find('dinr').text)
		
	if not (row.find('adspcfd').text==""):
		print(date, "(부식):", row.find('adspcfd').text)
