import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import accuracy_score
import pickle

import pandas as pd

df = pd.read_csv('jams_data.csv')
x_data = df.iloc[:,0:9]
y_data = df.iloc[:,9]

x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.3, random_state=33)

model = RandomForestRegressor(n_estimators=50, random_state=33)

model.fit(x_train, y_train)

accuracy = model.score(x_test, y_test)
print(f"Точность модели: {accuracy:3f}")

pickle.dump(model, open('rand_forest[0.86].pickle', 'wb'))