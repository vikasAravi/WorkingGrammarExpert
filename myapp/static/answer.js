$(function () {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        }
    });

    var showError = function (errorText, errorJSON) {
        var tooltip = errorJSON['message'] + "\nSuggestions:";

        for (var i = 0; i < errorJSON.suggestions.length; i++) {
            tooltip += "\n" + errorJSON.suggestions[i];
        }

        var tag = "span";
        if (errorText.trim().length == 0) {
            tag = "pre";
        }
        var x =
            "<" + tag + " class='error "
            + errorJSON.type
            + "' data-toggle='tooltip'"
            + " title='" + tooltip
            + "'>"
            + errorText
            + "</" + tag + ">";

        console.log(x);
        return x;
    }

    var showText = function (text) {
        return "<span class='correct'>" + text + "</span>";
    }

    var appendElem = function (e, html) {
        e.append($(html));
    }

    var highlightErrors = function (text, errors) {
        if (errors.length == 0) return;

        var offset = errors[0].offset;
        var length;
        var e = $('#essay');

        if (offset > 0) {
            appendElem(e, showText(text.substring(0, offset)));
        }

        for (var i = 0; i < errors.length; i++) {
            offset = errors[i].offset;
            length = errors[i].length;
            console.log(offset, length);
            appendElem(e, showError(
                text.substring(offset, offset + length),
                errors[i]
            ));

            if (i == errors.length - 1) {
                appendElem(e, showText(text.substring(offset + length)));
            } else {
                appendElem(e, showText(text.substring(offset + length, errors[i + 1].offset)));
            }
        }
    }
    var wordlimit = 150;

    var submitEssay = function (e) {
        //TODO: decide about word limit
        clearInterval(timer);
        let text = $('#id_answer').val();
        $.post(
            '/fetch/',
            {
                'essay': text,
            },
            function (data) {
                console.log(data)
                $('#score').text(data['score']);
                $('#w_c').text(data['wordCount']);
                $('#grammar').text(data['grammarErrorCount']);
                $('#spelling').text(data['spellingErrorCount']);
                if (data['wordCount'] >= wordlimit) {
                    $('#wordlimit').text("Met");
                } else {
                    $('#wordlimit').text("Failed");
                }
                $('#submit_button').hide();
                highlightErrors(text, data["errors"]);
                $('#id_answer').hide();
                $('#submit_button').hide();
                $('#wordcount').hide();
                $('#essay').show();
                $('#res').show();
            }, "json"
        )
    }

    $('#submit_button').click(submitEssay);

    //TIMER Functionality begins
    var timelimit = 1800; // in seconds
    var starttime = new Date().getTime();

    var pad = function (num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    var updateTimer = function () {
        var t = new Date();
        var timeinsec = timelimit - Math.floor((t.getTime() - starttime) / 1000);
        var timeinmin = Math.floor(timeinsec / 60);
        var actualsec = (timeinsec - timeinmin * 60);
        $('#time').text("Time : " + pad(timeinmin, 2) + " : " + pad(actualsec, 2));
        if (timeinsec == 0) {
            clearInterval(timer);
            submitEssay();
            console.log("time over");
        }

    }

    var timer = setInterval(updateTimer, 1000);
    //Timer functionality ends

    function wordCount(val) {
        var wom = val.match(/\S+/g);
        return {
            words: (wom ? wom.length : 0)
        };
    }

    var textarea = document.getElementById("id_answer");
    var result = document.getElementById("wordcount");
    textarea.addEventListener("input", function () {
        var v = wordCount(this.value);
        result.innerHTML = (
            v.words + " words"
        );
    }, false);
})
