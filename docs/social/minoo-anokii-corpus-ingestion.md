# Build an Indigenous-language corpus by dropping in video reels

Reference URL: https://github.com/waaseyaa/minoo/pull/881

## Bluesky

Cool minoo work: drop a stack of video reels into Anokii Workspace and each becomes a draft corpus entry, processed out of band into keyframes, audio, and a transcript. An Indigenous-language corpus built by drop-and-go. https://github.com/waaseyaa/minoo/pull/881 #buildinpublic

## LinkedIn

Language revitalization is a data problem before it is an AI problem. You need a corpus, and the corpus has to come from real speakers, on video.

minoo's Anokii Workspace v2 makes that part painless. There is now an Ingest tab with a drop zone that takes a whole stack of videos at once, mp4, mov, webm. Drop them and each file:

uploads into the corpus store, gets a draft example-sentence record linked to the video, and returns immediately so the UI never blocks.

Then the slow work happens out of band: ffmpeg pulls a keyframe and an audio track, the clip moves to a transcribe stage, and then to a curate stage where a person checks it. Ingest, transcribe, curate, one pipeline, with per-file progress and errors right in the workspace.

The design choice I like: upload and processing are decoupled. You can drop fifty reels and walk away. Nothing waits on a transcription to finish before accepting the next file.

This is the unglamorous foundation under any language model for a low-resource language: a fast, forgiving way to turn community video into structured, reviewable data. Built on Waaseyaa and Anokii.

https://github.com/waaseyaa/minoo/pull/881

#buildinpublic #ai #waaseyaa #php

## Facebook

Language revitalization is a data problem before it is an AI problem: you need a corpus, and it has to come from real speakers on video. minoo's Anokii Workspace v2 makes that part painless.

There is now an Ingest tab with a drop zone that takes a whole stack of videos at once. Drop them and each one uploads, becomes a draft corpus entry linked to the video, and returns immediately. The slow work happens out of band: ffmpeg pulls a keyframe and audio, then the clip moves to a transcribe stage and a curate stage where a person reviews it. Ingest, transcribe, curate, one pipeline.

The nice part is that upload and processing are decoupled, so you can drop fifty reels and walk away. It is the unglamorous foundation under any language work for a low-resource language. Built on Waaseyaa and Anokii. https://github.com/waaseyaa/minoo/pull/881

#buildinpublic
