(function( window, $){

  var baseURL = "https://api.github.com/repos/";

  function getStreamSha( user, callback ){
    var apiURL = user + "/gitter/branches";

    // Get the list of branches for the user's gitter repo,
    // and find the branch named stream.  Get the last commit
    // on the stream branch and pass to callback(), or else
    // use null if stream branch is not found.
    $.getJSON( apiURL, function( data ){
      data.forEach( function( branch ){
        if( branch.name === "stream" ){
          callback( branch.commit.sha );
        }
      });
    });
    callback( null );
  }

  function getStreamCommits( user, callback ){
    var apiURL = user + "/gitter/commits?per_page=100&sha=";

    getStreamSha( user, function( sha ){
      if( sha === null ){
        console.log( "No stream branch found for user `" + user + "`" );
        return;
      }

      apiURL += sha;

      $.getJSON( apiURL, function( commits ){
        var messages = [];

/**
  {
    "commit": {
      "message": "clean up horizontal dl option and docs",
      "committer": {
        "date": "2012-03-05T00:42:37-08:00",
        "name": "Mark Otto",
        "email": "markotto@twitter.com"
      },
      "tree": {
        "sha": "b4849a6927782d5de0756de9e43dc72e60ded80b",
        "url": "https://api.github.com/repos/twitter/bootstrap/git/trees/b4849a6927782d5de0756de9e43dc72e60ded80b"
      },
      "author": {
        "date": "2012-03-05T00:42:37-08:00",
        "name": "Mark Otto",
        "email": "markotto@twitter.com"
      },
      "url": "https://api.github.com/repos/twitter/bootstrap/git/commits/7a8d6b19767a92b1c4ea45d88d4eedc2b29bf1fa"
    },
    "committer": {
      "gravatar_id": "bc4ab438f7a4ce1c406aadc688427f2c",
      "login": "markdotto",
      "avatar_url": "https://secure.gravatar.com/avatar/bc4ab438f7a4ce1c406aadc688427f2c?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png",
      "url": "https://api.github.com/users/markdotto",
      "id": 98681
    },
    "author": {
      "gravatar_id": "bc4ab438f7a4ce1c406aadc688427f2c",
      "login": "markdotto",
      "avatar_url": "https://secure.gravatar.com/avatar/bc4ab438f7a4ce1c406aadc688427f2c?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png",
      "url": "https://api.github.com/users/markdotto",
      "id": 98681
    },
    "sha": "7a8d6b19767a92b1c4ea45d88d4eedc2b29bf1fa",
    "parents": [
      {
        "sha": "fb1d4a0f04504935eb17d13ac6d1dbb72c70b102",
        "url": "https://api.github.com/repos/twitter/bootstrap/commits/fb1d4a0f04504935eb17d13ac6d1dbb72c70b102"
      }
    ],
    "url": "https://api.github.com/repos/twitter/bootstrap/commits/7a8d6b19767a92b1c4ea45d88d4eedc2b29bf1fa"
  }
**/

        commits.forEach( function( c ){
          var commit = c.commit,
              author = c.author,
              sha = c.sha;

          messages.push({
            // TODO: this could fail
            gitterMessage: JSON.parse( commit.message ),
            author: {
              name: author.name,
              login: author.login,
              avatar: author.avatar_url
            },
            date: commit.commit.author.date,
            sha: sha
          });
        });

        callback( messages );
      });
    });
  }

  var gitter = {
    getStream: function( user, callback ){
      getStreamCommits( user, callback );
    }
  };

  window.gitter = gitter;

}(window, window.jQuery ));
