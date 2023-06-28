try {
    const app = require('express')();
    const axios = require('axios');
    require('dotenv').config();
    function getVideoInfo(videoId) {
        const data = {
            context: {
                client: {
                    hl: 'en',
                    clientName: 'WEB',
                    clientVersion: '2.20210721.00.00',
                    clientFormFactor: 'UNKNOWN_FORM_FACTOR',
                    clientScreen: 'WATCH',
                    mainAppWebInfo: {
                        graftUrl: `/watch?v=${videoId}`,
                    },
                },
                user: {
                    lockedSafetyMode: false,
                },
                request: {
                    useSsl: true,
                    internalExperimentFlags: [],
                    consistencyTokenJars: [],
                },
            },
            videoId: videoId,
            playbackContext: {
                contentPlaybackContext: {
                    vis: 0,
                    splay: false,
                    autoCaptionsDefaultOn: false,
                    autonavState: 'STATE_NONE',
                    html5Preference: 'HTML5_PREF_WANTS',
                    lactMilliseconds: '-1',
                },
            },
            racyCheckOk: false,
            contentCheckOk: false,
        };

        return axios.post('https://www.youtube.com/youtubei/v1/player?key=YOUR_API_KEY', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.data)
            .catch(error => {
                console.log('Error:', error.message);
                throw error;
            });
    }
    async function getYoutubeVideoUrl(videoId) {
        const videoData = { 'videos': {}, 'audio': {} };
        const formats = await getVideoInfo(videoId).then(data => data.streamingData.formats || []);
        formats.forEach(format => {
            if (format.mimeType.startsWith('video/mp4') && format.url) {
                videoData['videos'][format.qualityLabel] = format.url;
            } else if (format.mimeType.startsWith('audio') && format.url) {
                videoData['audio'].push(format.url);
            }
        });
        return videoData;
    }

    app.use(require('./zirconStreamMethod'))

    app.get('/video/video', async (req, res) => {
        if (typeof req.query.key === 'undefined') {
            res.status(404).send('Not Found');
            return;
        }
        const url = decryptUrl(req.query.key);
        if (requestFromVideoTag() || requestFromIframeTag()) {
            await streamReader(url, 'plain/text');
        } else {
            res.status(200).send(`
                <html>
                    <head>
                        <title>Zircon High Security File</title>
                        <style>
                            body {
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                width: 100vw;
                                height: 100vh;
                                padding: 0;
                                margin: 0;
                                box-sizing: border-box;
                                text-align: center;
                                font-size: 2rem;
                            }
                        </style>
                    </head>
                    <body dir="auto">
                        <h1>عييييييييييييييييييب</h1>
                        <h2>
                            عيب يا بابا اللي انت بتعمله دة
                            <br>
                            عيب ياحبيبي
                            <br>
                            باباك ومامتك مقالولكش إن دي سرقة؟
                        </h2>

                    </body>
                </html>
            `);
        }
    });

    app.get('/video/open/:url', async (req, res) => {
        videosUrls = await getYoutubeVideoUrl(req.params.url);
        videosUrls = videosUrls['videos']
        url = videosUrls[Object.keys(videosUrls)[0]] || req.params.url || req.query.url;
        res.send(`
            <html>
                <head>
                    <title>Test Open Video With Security</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            max-width: 100vw;
                            padding: 0;
                            margin: 0;
                            box-sizing: border-box;
                            text-align: center;
                            font-size: 2rem;
                        }
                        a {
                            text-decoration: none;
                            color: #fff;
                            background-color: #000;
                            padding: 1rem;
                            border-radius: 1rem;
                            margin: 1rem;
                            font-size: x-large;
                        }
                        video{
                            max-width: 100vw;
                            height: auto;
                        }
                    </style>
                </head>
                <body dir="auto">
                    <h3>Test Open Video With Security</h3>
                    <a target="_blank" href="/video/video?key=${encryptUrl(url)}">Open Video</a>
                    <video controls="">
                        <source src="/video/video?key=${encryptUrl(url)}" type="video/mp4">
                    </video>
                </body>
            </html>
        `);
    });

    app.listen({ port: process.env.PORT, Host: "0.0.0.0" }, () => {
        console.log('Listening on port http://127.0.0.1:' + process.env.PORT);
    });
} catch (e) {
    console.error(e.message)
}