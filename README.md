# Project

The project name is gitter, with a real name to be chosen later.

# Owners

* David Humphrey
* Jon Buckley
* others as agreed upon by the former members

# Description

gitter is a project to build a spec, API, and client(s) for a distributed, Twitter-like messaging system using git as a backend.  The aim of gitter is to enable the ease of social networking without the requirement that one give up his or her control over content.  Using git and github gives more than 1 million users instant access to the gitter messaging system without creating a new account (see http://en.wikipedia.org/wiki/GitHub#Statistics).

# Git/Github Backend

gitter uses git as a distributed filesystem, and github.com as primary git repo host (note: other git hosts are possible without affecting the architecture).  All gitter-messages are stored as JSON strings in a (usually) empty commit.  All gitter-message commits are done to the `master` branch in sequence.  As a result, every gitter-message is globally unique, and identifiable via a git commit sha, and includes metadata such as author, date, etc.

## Users

Users of gitter begin by forking the gitter repo.  This gives them a repo with, among other things, a file named `profile.json`.  The `profile.json` file contains information about the user, including things like:

* First Name: David
* Last Name Humphrey
* Account Name: humphd
* Preferred Nickname: humph
* Default License for Messages: http://url.to.license (e.g., MIT)
* Email Address: david.humphrey@senecacollege.ca
* URLs: [ "http://blog...", "http://work...", ... ]
* Locale: en-CA
* Time Zone: GMT-05:00
* Bio: The person writing this...
* etc

The `profile.json` file describes this gitter user, and indicates important hints for clients, for example the default license for all messages.

QUESTIONS: what license to use by default?  which licenses to allow?  by what end-point URLs?

## Following Users

Every gitter user has a fork of the gitter repo.  As a result, every user has a unique URL, for example:

`git://github.com/someone/gitter.git`

Following a user means adding their forked repo as a read-only remote to your gitter fork:

`git remote add someone git://github.com/someone/gitter.git`

Here the user at `git://github.com/someone/gitter.git` was added using their default github username.  However, the only thing that matters globally is the URL--we can use whatever name we want.  Unlike Twitter, G+, Facebook, etc., where two people can't share the same name, in gitter you can refer to people using any common name you want.  If I know `git://github.com/someone/gitter.git` as `dave`, I can use that shortname.  In fact, users can provide a Preferred Nickname in their `profile.json` file as a clue to clients.  In other words, we can:

`git remote add someone git://github.com/someone/gitter.git`
`git mv someone <Preferred Nickname in someone's profile.json>`

This means that two users can follow the same person (i.e., follow `git://github.com/someone/gitter.git`) and choose to refer to him/her with different names.  The gitter client will make sure there is no confusion internally, by always using URLs instead of short names.

QUESTIONS: how to reveal the list of followers and following for a user?

## Unfollowing Users

Unfollowing means removing a user's remote from the forked gitter repo of a user.

## Messages

A message is an escaped sequence of text.  No HTML is allowed.  Messages may be any length, but 140 characters is encouraged for compatibility with Twitter.  Messages are stored in JSON strings.  Here is the most basic example:

    { "text": "Writing a message in gitter!" }

Publishing this message involves doing an empty commit on the master branch of the user's fork of the gitter repo:

`git commit --allow-empty --message="{"text":"Writing a message in gitter!"}"`

And then pushing:

`git push origin master`

### Complex Messages

A message can be simple text.  A message can also contain various types of data, and refer to external data.

#### Messages with URLs

A message might include a URL, which is itself simple text:

    { "text": "Writing a message in gitter that includes a link to http://gitter.org" }

#### Messages Referring to Users

A message might include references to external gitter objects, for example, another user:

    {
      "text": "Writing a message in gitter that refers to @jon and @humph.",
      "users": {
        "jon": "git://github.com/jbuckca/gitter.git",
        "humph": "git://github.com/humphd/gitter.git"
      }
    }

In this example, two gitter users are referenced in the text.  The author has used the nicknames `@jon` and `@humph`, which in turn refer to URLs of remote gitter repo forks.  Other clients displaying this message might choose to show the nicknames differently, for example, if another user knows Jon as `jbuck` instead of `jon`.  Internally the mapping will be back to the URLs.

#### Messages Referring to Other Messages

A message might include a reference to another gitter message.  This can happen when a user Replies to another message, References something someone else said, or does the equivalent of a Retweet (RT):

    {
      "text": "Writing a message in gitter that refers to another message RT @jon gitter is awesome!",
      "users": {
        "jon": "git://github.com/jbuckca/gitter.git",
      },
      "references": [
        "git://github.com/jbuckca/gitter/commits/ec52b6907a1988f042eb61ac3450cf8361ef60b4",
      ]
    }

Here I can track back the author of a message referenced in the current message.  The fact that messages can reference one another removes the necessity that I copy things into the text itself--the client can surface this information alongside the message.

Another example of referencing might include providing context:

    {
      "text": "Replying to something Jon said, I think he's right",
      "references": [
        "git://github.com/jbuckca/gitter/commits/ec52b6907a1988f042eb61ac3450cf8361ef60b4",
      ]
    }

In this case the original message can be displayed alongside the current message, in order to preserve conversational context.

#### Messages with Unique Licenses

All messages are published under the user's desired license.  This is either the default gitter license (TBD), the license specified in the user's `profile.json` file, or the license specified in the message itself:

    {
      "text": "This is a message for which I want to specifically use license XYZ",
      "licenses": [
        "http://licenses/xyz"
      ]
    }

In this case the license(s) for this message overrides any other implied license for this user or gitter in general.  It is up to the client to surface this information.

#### Messages with Payloads

Users will typically refer to external resources via URLs.  For example, a video, image, or document on the web can be referenced in the text of the message itself.  However, there are times when it might be necessary or prudent to publish the content along with the message.  Because all messages are associated with commits, each message can also include a file or files.

    {
      "text": "This is a message which has a PDF payload",
      "payload": [
        "git://github.com/jbuckca/gitter/commits/ec52b6907a1988f042eb61ac3450cf8361ef60b4/document.pdf"
      ]
    }

Here the user has chosen to publish the PDF document to which they refer in the message.  This document, `document.pdf`, is committed along with their message.  Followers of this user can choose to obtain the document remotely (i.e., via payload URL), or can save it locally (e.g., `git fetch`).  In this way distributed publishing of content larger than appropriate for a message can be done easily.

QUESTIONS: how to avoid issues with people spamming payload files to their followers?  Will this behaviour simply make them unfollowable, and take care of itself?  What about files over a certain size, or of a certain type?  Should we provide a way to restrict this?  Can we only download commit log messages and not committed files?

## Updates

As users write and publish messages, their followers keep up-to-date with them via `git fetch --all`.  This pulls in all commits, and thus messages/payloads, from the users (i.e., remotes) this user follows.  Every user's messages exists via the `remotes/<remote username>/master` branch pointer.  Accessing and using the messages on these branches is possible without ever merging.

QUESTIONS: how to leverage git-hooks for push notifications and smarter updates?

## gh-pages?

Should we do some kind of hook to auto-publish a user's message stream to a user/gitter/gh-pages branch?  In this way we can provide a free hosted, web reachable stream for every user.

## Global Discovery, Trends, Searches

It's not yet clear how to mimic Twitter's Trends, Searches, etc.  This will likely require partnership with Github, and some way to search within all gitter forked repos.
