import requests
import json
import time

STREAM_URL = "https://stream.zeno.fm/2gi6vrilgwbtv"
JSON_PATH = "now_playing.json"

def get_zeno_metadata():
    try:
        response = requests.get(STREAM_URL, headers={'Icy-MetaData': '1'}, stream=True)
        metaint = int(response.headers.get('icy-metaint', 0))
        if metaint > 0:
            stream = response.raw
            stream.read(metaint)
            metadata_len = ord(stream.read(1)) * 16
            metadata = stream.read(metadata_len).decode('utf-8', errors='ignore')
            if 'StreamTitle' in metadata:
                title = metadata.split("StreamTitle='")[1].split("';")[0]
                return title
    except Exception:
        return "WYATT STATION - LIVE"
    return "OFFLINE"

while True:
    song = get_zeno_metadata()
    with open(JSON_PATH, 'w') as f:
        json.dump({"song": song}, f)
    time.sleep(10)