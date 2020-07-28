import pandas as pd
pd.plotting.register_matplotlib_converters()
import matplotlib.pyplot as plt
import seaborn as sns

print("Complete Setup")

emo_filepath = "../../Downloads/my_data.csv"
emo_data = pd.read_csv(emo_filepath, index_col="Index")

plt.title("The emotions displayed through out the session")
#plt.figure(figsize=(16,7))
plt.figure(figsize=(16,7))
#plt.rcParams["figure.figsize"] = (16,7)
sns.set_style("dark")
plt.xlabel("Frame number")
plt.ylabel("Emotion detected level")

sns.lineplot(data=emo_data['Joy'], label="Joy")
sns.lineplot(data=emo_data['Sadness'], label="Sadness")
sns.lineplot(data=emo_data['Fear'], label="Fear")
sns.lineplot(data=emo_data['Surprise'], label="Surprise")


plt.savefig("./ana_emotions3.png")