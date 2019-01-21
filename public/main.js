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
        let message = '';
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
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $messageInput.focus();

            socket.emit('add user', username);
        }
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

    // Log a message in chat window
    const log = (message, options) => {
        let $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    };

    // Prevents input from having injected markup
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

    socket.on('login', (data) => {
        connected = true;
        // Display the welcome message
        let message = "Welcome to Socket.IO Chat – ";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    socket.on('user joined', (data) => {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

});