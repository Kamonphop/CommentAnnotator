$(document).ready(function() {
    var workingComments = [];

    var counters = {
        comment: 0,
        src: 0,
        incrCom: function () { return ++this.comment },
        decrCom: function () { return --this.comment },
        resetCom: function () { return this.comment = 0 },
        endCom: function (a) { this.comment = a.length-1; return this.comment },
        incrSrc: function () { return ++this.src },
        decrSrc: function () { return --this.src },
        resetSrc: function () { return this.src = 0 },
        endSrc: function (a) { this.src = a.length-1; return this.src }
    };

    var userActivity = {
        user_id: currUserId,
        comments: []
    };

    function loadSourceText(idx) {
        var filename = sourceObj[idx].src_file.split('/').pop();
        return $.ajax({
            url: filename,
            async: true,
            success: function(data) {
                var $myCodeFrame = $("#myCodeFrame");
                $myCodeFrame.html(data);
                Prism.highlightElement($myCodeFrame[0]);
                workingComments = sourceObj[idx].comments;
            }
        });
    }

    $("#btnNextComment").click( function() {
        var j = nextIdx('comment', counters, workingComments);
        $('#myComment').html(workingComments[j].text);
    });

    $("#btnPrevComment").click( function() {
        var j = prevIdx('comment', counters, workingComments);
        $('#myComment').html(workingComments[j].text);
    });

    $("#btnNextSrc").click( function() {
        var i = nextIdx('source', counters, sourceObj);
        loadSourceText(i).done(function() {
            $('#myComment').html(workingComments[0].text);
            counters.resetCom();
        });
    });

    $("#btnPrevSrc").click( function() {
        var i = prevIdx('source', counters, sourceObj);
        loadSourceText(i).done(function() {
            $('#myComment').html(workingComments[0].text);
            counters.resetCom();
        });
    });

    function nextIdx(flag, counters, theList) {
        switch (flag) {
            case 'comment':
                if (counters.comment === theList.length-1) return counters.resetCom();
                return counters.incrCom();
                break;
            case 'source':
                if (counters.src === theList.length-1) return counters.resetSrc();
                return counters.incrSrc();
                break;
        }
    }

    function prevIdx(flag, counters, theList) {
        switch (flag) {
            case 'comment':
                if (counters.comment === 0) return counters.endCom(theList);
                return counters.decrCom();
                break;
            case 'source':
                if (counters.src === 0) return counters.endSrc(theList);
                return counters.decrSrc();
                break;
        }
    }

    $("#btnA").click( function() {
        userActivity.comments.push({
            _src: sourceObj[counters.src]._id,
            _comment: workingComments[counters.comment]._id,
            label: 'a'
        });
        $('#actData').val(JSON.stringify(userActivity));
        console.log(userActivity);
    });

    loadSourceText(0);
});
