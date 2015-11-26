$(document).on('click', '.top-bar', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
    }
});

 $('#btn-input').keypress(function(e) {
                if(e.which == 13) {
                   alert("click");
                }
            });

$(document).on('click', '.icon_close', function (e) {
    $( "#chat_window_1" ).remove();
});
