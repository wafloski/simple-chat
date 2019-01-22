$(function(){
    const socket = io();

    let $window = $(window),
        $usernameInput = $('.usernameInput'),
        $currentInput = $usernameInput.focus(),
        $messageInput = $('.messageInput'),
        $loginPage = $('.container.login'),
        $chatPage = $('.container.chat'),
        $messages = $('.messages'),
        username,
        connected = false;

    const addParticipantsMessage = (data) => {
        let message = "";
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    };

    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());
        if(username) {
            $loginPage.fadeOut();
            $chatPage.css('display','flex');
            $loginPage.off('click');
            $currentInput = $messageInput.focus();

            socket.emit('add user', username);
        }
    };

    const sendMessage = () => {
        let message = $messageInput.val();
        message = cleanInput(message);
        if (message && connected) {
            $messageInput.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    };

    const addChatMessage = (data, options) => {
        // Don't fade the message in if there is an 'X was typing'
        let $typingMessages = getTypingMessages(data);

        options = options || {};

        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        let $usernameDiv = $('<span class="username"/>')
          .text(data.username);

        let $messageBodyDiv = $('<span class="messageBody">')
          .text(data.message);

        let typingClass = data.typing ? 'typing' : '';

        let $messageDiv = $('<li class="message"/>')
          .data('username', data.username)
          .addClass(typingClass)
          .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    };

    const addMessageElement = (el, options) => {
        let $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn();
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    };

    const getTypingMessages = (data) => {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    };

    const removeChatTyping = (data) => {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    };

    // Log a message in chat window
    const log = (message, options) => {
        let $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    };

    // To prevent input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    };

    // Keyboard events
    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });


    // Click events
    $loginPage.click(() => {
        $currentInput.focus();
    });


    // Socket events
    socket.on('login', (data) => {
        connected = true;
        let message = "Welcome to Chadowy Chat";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    socket.on('user joined', (data) => {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    socket.on('new message', (data) => {
        addChatMessage(data);
    });

    socket.on('user left', (data) => {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    socket.on('disconnect', () => {
        log('you have been disconnected');
    });

});