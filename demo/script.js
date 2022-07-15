// ----------------------------------------------------- globals / data

const dataSections = JSON.parse(document.getElementById('data-sections').innerText);
const dataTweets = JSON.parse(document.getElementById('data-tweets').innerText);


// -----------------------------------------------------  dom
const eTweetContainer = document.getElementById('tweet')
const eInsightsHashtags = document.getElementById('insights-hashtags')
const eInsightsReferences = document.getElementById('insights-references')

// ----------------------------------------------------- filter 

const filter = {
    topic: null,
    stance: null,
    hashtag: null,
    tweetIDs: [],
    index: 0,
    prev: () => new Promise((resolve, reject) => {
        if (filter.index > 0) {
            filter.index--
            resolve(filter.tweetIDs[filter.index])
        } else {
            reject("INDEX OUT OF BOUNDS")
        }        
    }),
    next: () => new Promise((resolve, reject) => {
        if (filter.tweetIDs.length > filter.index + 1) {
            filter.index++
            resolve(filter.tweetIDs[filter.index])
        } else {
            reject("INDEX OUT OF BOUNDS")
        }
    }),
    filter: () => new Promise((resolve, reject) => {
        filter.tweetIDs = []
        for(const [tweetID, tweetData] of Object.entries(dataTweets)) {
            if (
                (filter.topic == null || filter.topic == tweetData.target) &&
                (filter.stance == null || filter.stance.toLowerCase() == tweetData.label.toLowerCase()) &&
                (filter.hashtag == null || tweetData.hashtags.includes(filter.hashtag))
            ) {
                filter.tweetIDs.push(tweetID)
            }
        }

        //
        if (filter.tweetIDs.length > 0) {
            resolve(filter.tweetIDs)
        } else {
            reject("NO DATA AVAILABLE FOR SELECTED FILTER OPTIONS")
        }
    })
}

// ----------------------------------------------------- Handler 

function selectTopic(topic) {
    if (topic == "all")
        topic = null

    loadHashtagFilter(topic)

    filter.topic = topic
    filter.hashtag = null
    filter.filter()
        .then(tweetIDs => loadTweet(tweetIDs[0]))
        .catch(e => console.error(e))
}

function selectStance(stance) {
    if (stance == "all")
        stance = null

    filter.stance = stance
    filter.filter()
        .then(tweetIDs => loadTweet(tweetIDs[0]))
        .catch(e => console.error(e))
}

function selectHashTag(hashtag) {
    if (hashtag == "all")
        hashtag = null

    filter.hashtag = hashtag
    filter.filter()
        .then(tweetIDs => loadTweet(tweetIDs[0]))
        .catch(e => console.error(e))
}

function nextTweet() {
    filter.next()
        .then(tweetID => loadTweet(tweetID))
        .catch(e => console.error(e))
}

function prevTweet() {
    filter.prev()
        .then(tweetID => loadTweet(tweetID))
        .catch(e => console.error(e))
}

function windowKeyHandler(e) {
    if (e.keyCode == '37') {
        prevTweet()
    } else if (e.keyCode == '39') {
        nextTweet()
    }
}

// ----------------------------------------------------- display
function initializeFilter() {
    loadTopicFilter()
    document.getElementById('filter-topic').addEventListener('change', e => selectTopic(e.target.value))

    loadStanceFilter()
    document.getElementById('filter-stance').addEventListener('change', e => selectStance(e.target.value))

    loadHashtagFilter(null)
    document.getElementById('filter-hashtags').addEventListener('change', e => selectHashTag(e.target.value))

    // filter
    filter.filter()
        .then(tweetIDs => loadTweet(tweetIDs[0]))
        .catch(e => console.error(e))
}

function loadTopicFilter() {
    const eSelect = document.getElementById('filter-topic')
    eSelect.innerHTML = ""

    var eOption = document.createElement('option')
    eOption.innerHTML = "All Topics"
    eOption.value = "all"
    eSelect.appendChild(eOption)

    for(topic of dataSections.topics) {
        eOption = document.createElement('option')
        eOption.innerHTML = topic
        eOption.value = topic
        eSelect.appendChild(eOption)
    }
}

function loadStanceFilter() {
    const eSelect = document.getElementById('filter-stance')
    eSelect.innerHTML = ""

    var eOption = document.createElement('option')
    eOption.innerHTML = "All Stances"
    eOption.value = "all"
    eSelect.appendChild(eOption)

    for(stance of dataSections.stance) {
        eOption = document.createElement('option')
        eOption.innerHTML = stance
        eOption.value = stance
        eSelect.appendChild(eOption)
    }
}

function loadHashtagFilter(topic) {
    const eSelect = document.getElementById('filter-hashtags')
    eSelect.innerHTML = ""

    if (topic === null) {
        eSelect.disabled = true
        eSelect.parentElement.style.opacity = 0.5
    } else {
        eSelect.disabled = false
        eSelect.parentElement.style.opacity = 1

        var eOption = document.createElement('option')
        eOption.innerHTML = "All Hashtags"
        eOption.value = "all"
        eSelect.appendChild(eOption)
    
        for(hashtag of dataSections.hashtags[topic]) {
            eOption = document.createElement('option')
            eOption.innerHTML = hashtag
            eOption.value = hashtag
            eSelect.appendChild(eOption)
        }
    }
}

function loadTweet(tweetID) {
    const tweetData = dataTweets[tweetID]
    console.info('load tweet: ', tweetID)

    // embed tweet
    embedTweet(tweetID)

    // display insights
    displayInsights(tweetData.hashtags, tweetData.mentions)

    // display similar
    for(const eBar of document.getElementsByClassName('bar'))
        eBar.style.display = "none"

    var simIndex = 0
    for(const [simTweetID, similarity] of Object.entries(tweetData.similar)) {
        if (simTweetID in dataTweets) {
            const simTweetData = dataTweets[simTweetID]
            fillSimilarTweet(simIndex, simTweetData.text, simTweetData.label, similarity)
            simIndex++
        } else {
            console.error("loadTweet: unknown similar tweetID (", simTweetID, ")")
        }
    }

    // display stats
    loadStatisticCharts(tweetData.target)

    //
    updatePageSelectors()
}

function updatePageSelectors() {
    const ePrevSelector = document.getElementById('tweet-prev')
    const eNextSelector = document.getElementById('tweet-next')

    ePrevSelector.style.opacity = filter.index > 0 ? 1 : 0.2
    eNextSelector.style.opacity = filter.index < filter.tweetIDs.length - 1 ? 1 : 0.2
}

function embedTweet(tweetID) {
    const config = {
        theme: 'dark'
    }
    
    eTweetContainer.innerHTML = ""
    return twttr.widgets.createTweet(tweetID, eTweetContainer, config)
}

function displayInsights(hashtags, references) {
    var eAnchor

    eInsightsHashtags.innerHTML = ""
    for(const hashtag of hashtags) {
        eAnchor = document.createElement('a')
        eAnchor.innerText = hashtag
        eAnchor.href = 'https://twitter.com/hashtag/' + hashtag.substring(1)
        eInsightsHashtags.appendChild(eAnchor)
    }

    eInsightsReferences.innerHTML = ""
    for(const reference of references) {
        eAnchor = document.createElement('a')
        eAnchor.innerText = reference
        eAnchor.href = 'https://twitter.com/' + reference
        eInsightsReferences.appendChild(eAnchor)
    }
}

function fillSimilarTweet(index, text, type, score) {
    const eBar = document.getElementsByClassName('bar')[index]
    const eBarIndicator = eBar.getElementsByClassName('bar-indicator')[0]
    const eBarText = eBar.getElementsByClassName('bar-text')[0]
    const eBarType = eBar.getElementsByClassName('bar-type')[0]

    eBar.style.display = 'block'
    eBarIndicator.style.width = parseInt(parseFloat(score) * 100) + "%";
    eBarText.innerText = text
    eBarType.innerText = type
}

function loadStatisticCharts(topic) {
    const eStanceChart = document.getElementById('stance-chart');
    const eHashtagChart = document.getElementById('hashtag-chart');
    const eMentionChart = document.getElementById('mention-chart');
    const eEmojiChart = document.getElementById('emoji-chart');

    eStanceChart.src = 'images/stance/' + topic + '.png'
    eHashtagChart.src = 'images/hashtag/' + topic + '.png'
    eMentionChart.src = 'images/mention/' + topic + '.png'
    eEmojiChart.src = 'images/emoji/' + topic + '.png'
}

// ----------------------------------------------------- main

setTimeout(initializeFilter, 1000)
window.addEventListener('keydown', windowKeyHandler)
