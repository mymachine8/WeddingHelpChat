+function ($) {
    var socket = io();
    var serviceIds = [];
    var customers ={};
    for (var index = 0; index < userDetails.services.length; index++) {
        serviceIds.push(userDetails.services[index].CareServiceId);
    }
    var executive = new ServiceExecutive(userDetails.userId, userDetails.userName, serviceIds);
    var getChatbartext = function () {
        var chatbartext = '<div class="row chat-window col-xs-5 col-md-2" id="chat_window" style="margin-left:10px;">'
        chatbartext += '<div class="panel panel-default">'
        chatbartext += '<div class="panel-heading top-bar">'
        chatbartext += '<div class="titleContainer col-md-10 col-xs-10">'
        chatbartext += '<!-- Chat Title comes here -->'
        chatbartext += '</div>'
        chatbartext += '<div class="col-md-2 col-xs-2 pull-right" style="text-align: right;">'
        chatbartext += '<a href="#"><span class="glyphicon glyphicon-remove icon_close" data-id="chat_window"></span></a>'
        chatbartext += '</div>'
        chatbartext += '</div>'
        chatbartext += '<div class="panel-body">'
        chatbartext += '<div class="msg_container_base">'
        chatbartext += '</div>'
        chatbartext += '<div class="panel-footer">'
        chatbartext += '<div class="form-group message-input">'
        chatbartext += '<input type="text" class="form-control input-sm" id="btn-input" placeholder="Write your message...">'
        chatbartext += '</div>'
        chatbartext += '</div>'
        chatbartext += '</div>'
        chatbartext += '</div>'
        chatbartext += '</div>';
        return chatbartext;
    };
    var $chatbarTemplate = $(getChatbartext());

    var getSentMessageText = function () {
        var sentMessageText = '<div class="row msg_container base_sent">'
        sentMessageText += '<div class="chat_spike pull-right">'
        sentMessageText += '</div>'
        sentMessageText += '<div class="messages msg_sent pull-right">'
        sentMessageText += '</div>'
        sentMessageText += '</div>';
        return sentMessageText;
    };

    var $sentMessageTemplate = $(getSentMessageText());


    var getReceiveMessageText = function () {
        var receiveMessageText = '<div class="row msg_container base_receive">'
        receiveMessageText += '<div class="chat_spike pull-left">'
        receiveMessageText += '</div>'
        receiveMessageText += '<div class="messages msg_receive pull-left">'
        receiveMessageText += '</div>'
        receiveMessageText += '</div>';
        return receiveMessageText;
    };

    var $receiveMessageTemplate = $(getReceiveMessageText());
    var $chatbarTitleTemplate = $('<label class="panel-title"></label>');

    var createChatbar = function (receivedMessage) {
        var $cloneChatbar = $chatbarTemplate.clone();
        $cloneChatbar.attr('id', 'chatbar' + receivedMessage.senderId);
        var $cloneTitle = $chatbarTitleTemplate.clone();
        $cloneTitle.attr('id', 'title' + receivedMessage.senderId);
        $cloneTitle.append(receivedMessage.senderId);
        $cloneChatbar.find('.titleContainer').append($cloneTitle);
        $cloneChatbar.find('#minim_chat_window').attr('id', 'minim_chat_window' + receivedMessage.senderId);
        $cloneChatbar.find('#btn-chat').attr('id', 'btn-chat' + receivedMessage.senderId);
        $cloneChatbar.find('#btn-input').attr('id', 'btn-input' + receivedMessage.senderId);
        var size = 10;
        var size_total = size;
        if ($(".chat-window:last-child").length > 0) {
            size = $(".chat-window:last-child").css("margin-left");
            size_total = parseInt(size) + 350;
        }

        $cloneChatbar.css("margin-left", size_total);
        $('.maincontainer').append($cloneChatbar);
        attachEventHandlers($cloneChatbar, receivedMessage);
    };

    var typingStatusList = [];
    var timeoutList = [];
    function timeoutFunction(receivedMessage) {
        return function (){
            typingStatusList[receivedMessage.senderId] = false;
            sendStopTyping(receivedMessage);
        };
    };
    var attachEventHandlers = function ($cloneChatbar, receivedMessage) {
        $cloneChatbar.on('click', '.top-bar', function (e) {
            var $this = $(this);
            if (!$this.hasClass('panel-collapsed')) {
                $this.parents('.panel').find('.panel-body').slideUp();
                $this.addClass('panel-collapsed');
            } else {
                $this.parents('.panel').find('.panel-body').slideDown();
                $this.removeClass('panel-collapsed');
            }
        });
        $cloneChatbar.on('click', '.icon_close', function (e) {
                addToRecent(receivedMessage.senderId);
                $this.remove();
        });

        $('#btn-input' + receivedMessage.senderId).keypress(function (e) {
            if (e.which == 13) {
                var content = $('#btn-input' + receivedMessage.senderId).val();
                $('#btn-input' + receivedMessage.senderId).val('');
                send(content, receivedMessage);
            }
            else {
                if (typingStatusList[receivedMessage.senderId] === undefined || typingStatusList[receivedMessage.senderId] === false) {
                    typingStatusList[receivedMessage.senderId] = true;
                    sendTyping(receivedMessage);
                }

                else {
                    clearTimeout(timeoutList[receivedMessage.senderId]);
                    timeoutList[receivedMessage.senderId] = setTimeout(timeoutFunction(receivedMessage), 5000);
                }
            }
        });
    };

    var sendTyping = function (receivedMessage) {
        var message = {};
        message.senderId = userDetails.userId,
            message.receiverId = receivedMessage.senderId
        message.serviceId = receivedMessage.serviceId
        socket.emit("typing", message);
    };

    var sendStopTyping = function (receivedMessage) {
        var message = {};
        message.senderId = userDetails.userId;
        message.receiverId = receivedMessage.senderId;
        message.serviceId = receivedMessage.serviceId;
        socket.emit("stop typing", message);
    };

    var addTyping = function (message) {
        var $loadingContainer = $('#chatbar' + message.senderId).find('.typing');
        if ($loadingContainer.length > 0) {
            $loadingContainer.find('.img-type').removeClass("hide");
            $loadingContainer.find('.img-type').addClass("show");
            $loadingContainer.find('.dots').removeClass("small");
            return;
        }
        var $clonereceive = $receiveMessageTemplate.clone();
        $clonereceive.addClass('typing')
        $clonereceive.find('.msg_receive').append('<div class="dots"><img src="/images/typing.gif" class="img-type show"/><div>');
        $('#chatbar' + message.senderId).find('.msg_container_base').append($clonereceive);
    };

    var removeTyping = function (message) {
        var $loadingContainer = $('#chatbar' + message.senderId).find('.typing');
        if ($loadingContainer.length > 0) {
            $loadingContainer.find('.img-type').removeClass("show");
            $loadingContainer.find('.img-type').addClass("hide");
            $loadingContainer.find('.dots').addClass("small");
        }
    };

    var removeTypingContainer = function (message) {
        var $loadingContainer = $('#chatbar' + message.senderId).find('.typing');
        if ($loadingContainer.length > 0) {
            $loadingContainer.remove();
        }
    };
    var send = function (content, receivedMessage) {
        var message = new Message(userDetails.userId, receivedMessage.senderId, receivedMessage.serviceId, content);
        sendMessage(message);
        socket.emit('new message', message);
    };
    var receiveMessage = function (message) {
        var $chatbar = $('#chatbar' + message.senderId);
        var $clonereceive = $receiveMessageTemplate.clone();
        removeTypingContainer(message);
        $clonereceive.find('.msg_receive').append(messageTemplate(message));
        $chatbar.find('.msg_container_base').append($clonereceive);
    };

    var messageTemplate = function (message) {
        return '<p>' + message.content + '</p>';
    };

    var sendMessage = function (message) {
        var $chatbar = $('#chatbar' + message.receiverId);
        var $clonesent = $sentMessageTemplate.clone();
        $clonesent.find('.msg_sent').append(messageTemplate(message));
        $chatbar.find('.msg_container_base').append($clonesent);
    };

    var customerTemplate = function(customer){
        return '<div id="'+customer.id+'"><label>'+customer.name+'</label><label> ('+customer.email+')</label></div>';
    };
    var addToActive = function(id){
        if(customers[id]=== undefined || customers[id]){
            $.get( "customer/"+id, function( customer ) {
                $("#recent").append(customerTemplate(customer));
                if($("#active").find("c"+id).length>0){
                    $("#active").find("c"+id).remove();
                }
            });
        }
    };

    var addToRecent = function(id){
        if(customers[id]=== undefined || customers[id]){
            $.get( "customer/"+id, function( customer ) {
                $("#active").append(customerTemplate(customer));
                if($("#recent").find("c"+id).length>0){
                    $("#recent").find("c"+id).remove();
                }
            });
        }
    };

    var activeChats = [];
    socket.on('connect', function () {
        socket.emit('executive connect', executive);
    });

    socket.on('new message', function (message) {
        var isPresent = false;
        for (var i = 0; i < activeChats.length; i++) {
            if (message.senderId == activeChats[i].senderId)
                isPresent = true;
        }
        if (!isPresent) {
            activeChats.push(message);
            createChatbar(message);
            receiveMessage(message);
            addToActive(message.senderId);
        }
        else {
            receiveMessage(message);
        }
    });

    socket.on('typing', function (message) {
        addTyping(message);
    });
    socket.on('stop typing', function (message) {
        removeTyping(message);
    });

    $(document).ready(function(){
        $("#executiveName").text(userDetails.userName);
        var services = "";
        for (var index = 0; index < userDetails.services.length; index++) {
            services +=  ', ' + userDetails.services[index].ServiceName;
        }
        services = services.substring(1);
        $("#executiveServices").text(services);
        $("#dashboard").removeClass("hide");
    });

}(jQuery);