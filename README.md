# EU-Stance
Website of the project EU-Stance


## Storage:

The HTTP Website consists of a main index.html page and four subpages for informational text. As well as a folder with

### Folder structure:

```bash
|--demo
|    |-- index.html
|    |-- disclaimer.html
|    |-- annotationGuideline.html
|    |-- dataStatements.html
|    |-- possibleErrors.html
|    |-- style.css
|    |-- script.js
|    |-- images
|           |--- hashtag
|           |       |------ png files with statistics per topic
|           |---- mention
|           |       |------ png files with statistics per topic
|           |---- emoji
|           |       |------ png files with statistics per topic
|           |---- stance
|           |       |------ png files with statistics per topic
```

The **index.html** holds the json files (schema can be found at json_schema_filtering and json_schema_data). Those can be replaced, whilst using the same structure.
If changes are made, make sure to keep the same topic names for all folders. The tweets were accessed by their unique tweet ID.

The **image folder** holds the statistic images of the type hashtag, mention, emoji and stance. The statistics were currently generated via the python library matplotlib and saved under the topic name. We present one statistic of each type for each topic.
The image size is 432 × 288 can however be changed to other size if needed.

The **tweet similarity** is currently calculated by the cosine similarity between the tweets. Similar tweets and their score were stored at the original tweets json section. 

The tweet json file does not need to have an entry in either of the fields, but must stick to the given structure.



## Usage:

Open the index.html file in your browser.
Use the blue arrows beside the tweet to cycle through the tweets.
Filter on the left for specific topics, stance or hashtags. The tweet selection will be adapted accordingly. 
Below the tweet are more insights on the used topic, hashtags and similar tweets.
