var socket = io();

function validateMessage(message) {
  var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (message === '' || format.test(message)) {
    return false
  }
  else {
    return true
  }
}
var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

socket.on('connect', () => {
});

//Sign Up User
jQuery('#signupform').on('submit', function (event) {
  event.preventDefault();
  var username = jQuery('[name=signupusername]').val();
  var email = jQuery('[name=signupuseremail]').val();
  var password1 = jQuery('[name=password1]').val();
  var password2 = jQuery('[name=password2]').val();

  if (!validateMessage(username)) {
    jQuery('#username-msg').text('Username can not contain special charcters or null');
    return;
  }
  else if (username.length < 6) {
    jQuery('#username-msg').text('Username must contain 6 characters');
    return;
  }
  else if (!emailRegex.test(String(email).toLowerCase())) {
    jQuery('#email-msg').text('Email is not Valid');
    return;
  }
  else if (password1.length < 6) {
    jQuery('#password-msg').text('Password Length must be 6 Characters');
    return;
  }
  else if (password1 !== password2) {
    jQuery('#password-msg').text('Passwords are not matching');
    return;
  }
  else {
    var data = {
      username: username,
      email: email.toLowerCase(),
      password: password1
    }
    socket.emit('saveuser', data, function (message) {
      jQuery('#username-msg').text('');
      jQuery('#email-msg').text('');
      jQuery('#password-msg').text('');
      jQuery('#signupform').trigger('reset');
      if (message === 'done') {
        jQuery('#singupform-msg').removeClass('text-danger');
        jQuery('#singupform-msg').addClass('text-success');
        jQuery('#singupform-msg').text('You have successfully Signed Up. Please Sign In with your Credentials');
      }
      else if (message.includes('username_1')) {
        jQuery('#singupform-msg').addClass('text-danger');
        jQuery('#singupform-msg').text('Username is already taken.');
      }
      else if (message.includes('email_1')) {
        jQuery('#singupform-msg').addClass('text-danger');
        jQuery('#singupform-msg').text('Email is already taken.');
      }
      else {
        jQuery('#singupform-msg').addClass('text-danger');
        jQuery('#singupform-msg').text('Something went wrong please try after sometime.');
      }
    })
  }
})

jQuery('#signupform').on('reset', function (event) {
  jQuery('#username-msg').text('');
  jQuery('#email-msg').text('');
  jQuery('#password-msg').text('');
})


//Sign InUser
jQuery('#signinform').on('submit', function (event) {
  var username = jQuery('[name=username]').val();
  var password = jQuery('[name=password]').val();

  if (!validateMessage(username)) {
    event.preventDefault();
    jQuery('#loginusername-msg').text('Your Username must not contain special charcters or null');
    return;
  }
  else if (password.length < 6) {
    event.preventDefault();
    jQuery('#loginpassword-msg').text('Your password must have been 6 charcters long');
    return;
  }
})
jQuery('#signinform').on('reset', function (event) {
  jQuery('#loginusername-msg').text('');
  jQuery('#loginpassword-msg').text('');
})

//forgotUserName
jQuery('#forgotform').on('submit', function (event) {
  event.preventDefault();
  var email = jQuery('[name=forgotemail]').val();
  if (!emailRegex.test(String(email).toLowerCase())) {
    jQuery('#forgotemail-msg').text('Please Enter a valid Email');
    return;
  }
  socket.emit('forgetcred', { email }, function (message) {
    jQuery('[name=forgotemail]').val('');
    if (message === 'Message Sent') {
      jQuery('#forgotemail-msg').text('A Email has been sent with your Credentials.');
    }
    else {
      jQuery('#forgotemail-msg').text('Provided Email Id does not Exist');
    }
  });
});

jQuery('#forgotform').on('reset', function (event) {
  jQuery('#forgotemail-msg').text('');
});


/** Change Password */
jQuery('#changepasswordform').on('submit', function (event) {
  event.preventDefault();
  var email = jQuery('[name=userupdateemail]').val();
  var oldpassword = jQuery('[name=oldpassword]').val();
  var newpassword = jQuery('[name=newpassword]').val();

  if (!emailRegex.test(String(email).toLowerCase())) {
    jQuery('#pass-msg').text('Please Enter a valid Email');
    return;
  }
  else if (oldpassword.length < 6 || newpassword.length < 6) {
    jQuery('#pass-msg').text('Length of passwords must be 6 charcaters');
    return;
  }
  socket.emit('changepassword', { email: email.toLowerCase(), oldpassword, newpassword }, function (message) {
    jQuery('[name=userupdateemail]').val('');
    jQuery('[name=oldpassword]').val('');
    jQuery('[name=newpassword]').val('');
    if (message === 'done') {
      jQuery('#final-msg').removeClass('text-danger');
      jQuery('#final-msg').addClass('text-success');
      jQuery('#final-msg').text('Your Password has been changed');
    }
    else if (message === 'Invalid') {
      jQuery('#final-msg').addClass('text-danger');
      jQuery('#final-msg').text('Your Password is not matching. Please provide correct password');
    }
    else {
      jQuery('#final-msg').addClass('text-danger');
      jQuery('#final-msg').text('Something went Wrong. Please try after sometime');
    }
  });
});

jQuery('#changepasswordform').on('reset', function (event) {
  jQuery('#pass-msg').text('');
  jQuery('#final-msg').text('');
});

jQuery('#clearhistory').on('click', function (event) {
  event.preventDefault();
  socket.emit('clearhistory', {}, function (message) {
    if (message === 'done') {
      alert('Your History has been cleared')
      window.location.reload();
    }
    else if (message === 'Failed') {
      alert('Your History must contain atleast 1 item')
    }
  })
});

socket.on('disconnect', () => {
});