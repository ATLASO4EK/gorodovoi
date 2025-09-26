import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import accuracy_score

import pandas as pd

df = pd.read_csv('jams_data.csv')
x_data = df.iloc[:,0:9]
y_data = df.iloc[:,9]

x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.3, random_state=33)

model = RandomForestRegressor(n_estimators=100, random_state=33)

model.fit(x_train, y_train)

out = np.around(model.predict(x_test), 1)
equality = out == y_test

df1 = pd.DataFrame(data = equality)

accuracy = model.score(x_test, y_test)
print(f"Точность модели: {accuracy:3f}")