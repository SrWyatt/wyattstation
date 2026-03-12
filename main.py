import json
import time

JSON_PATH = "now_playing.json"

while True:
    with open(JSON_PATH, 'w') as f:
        json.dump({"song": "WYATT STATION - BROADCAST"}, f)
    time.sleep(60)
