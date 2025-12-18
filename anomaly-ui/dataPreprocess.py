import pandas as pd
import io
import requests
import base64
import json
import sys

def analyzeHeader(filePath, header):
    print("called!!")

    url = "https://adb-2168240114663192.12.azuredatabricks.net/api/2.0/dbfs/put"
    token = "dapif58f4fb9ae353325d61a868335790dc0T"
    clusterId = "1114-085624-6g9pan4q"
    notebookPath = "/Users/adaan.ahmad@ucalgary.ca/data-anomaly-ai/Anomaly Detection Logic"
    

    try:
        df = pd.read_csv(filePath)
        data = df[[header]]

        csvTemp = io.StringIO()
        data.to_csv(csvTemp, index = False)
        tempBytes = csvTemp.getvalue().encode()
        csvContents = base64.b64encode(tempBytes).decode("utf-8")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
            }
        payload = {"path": "/user/hive/warehouse/currentCheck.csv", "contents": csvContents, "overwrite": True}

        resp = requests.post(url, headers=headers, json=payload)

        print("Status Code:", resp.status_code)
        print("Response Text:", resp.text)

        if resp.status_code == 200:
            print("✅ Upload successful!")
        else:
            print("❌ Upload failed!")

    
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    path = sys.argv[1]
    header = sys.argv[2]
    analyzeHeader(path, header)



