$(document).ready(function() {
  $('#signuplink').click(function(e) {
    e.preventDefault();
    $('#signupdiv').toggle('500');
    $('#logindiv').toggle('500');
  });
  $('#loginlink').click(function(e) {
    e.preventDefault();
    $('#signupdiv').toggle('500');
    $('#logindiv').toggle('500');
  });

  $('#form-signup').on('submit',function(event){
    if($('#signuppassword').val() != $('#signuppassword').val()){
      event.preventDefault();
    }
    else{
    $(this).children('#signuppassword2').remove();
  }
  });
});