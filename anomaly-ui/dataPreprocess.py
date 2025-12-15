import pandas as pd
import sys

dataPath = sys.argv[1]

df = pd.read_csv(csv_path)
headerList = list(df.column.values)

if len(headerList) == 0:
    print("fun")
else:

