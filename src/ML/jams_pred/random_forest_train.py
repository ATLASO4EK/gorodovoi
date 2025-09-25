from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import accuracy_score

import pandas as pd

df = pd.read_csv('jams_data.csv')
x_data = df.iloc[:,0:2]
y_data = df.iloc[:,3]

x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.3, random_state=42)

model = RandomForestRegressor(n_estimators=399, random_state=42)

model.fit(x_train, y_train)

accuracy = model.score(x_test, y_test)
print(f"Точность модели: {accuracy:3f}")