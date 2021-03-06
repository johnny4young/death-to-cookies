function login (form) {
  var data = form.serialize();
  $.ajax({
    url: '/login',
    data: data,
    type: 'POST'
  }).done(function (result) {
    load_token(result.token);
  });
}

function load_token(token) {
  var profile = jwt_decode(token);

  if (profile.exp < (new Date().getTime() / 1000)) {
    store.remove('id_token');
    show_login();
    return;
  }

  //set the token for api calls
  set_api_token(token);
  store_token(token);

  show_profile(profile);
}

function show_profile(profile) {
  $('#login').hide();
  $('.bio-name').html(profile.first_name);
  $('#bio').show();
}

function show_login () {
  $('.bio-name').html('');
  $('#bio').hide();
  $('#login').show();
}

function store_token(token) {
  store.set('id_token', token);
}

function set_api_token(token) {
  $.ajaxSetup({
    beforeSend: function (xhr) {
      //make sure where you send the header.
      //in this case we will send it only to requests to our own domain:
      if (this.crossDomain) return;

      //other option
      //if(!this.url.match(/^https\:\/\/api\.myapp\.com/)) return;

      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  });
}

function send_email() {
  set_api_token(store.get('id_token'));
  $.ajax({
    url: '/api/send_email',
    cache: false
  }).done(function (data) {
    $('.error').hide();
    $('.result').show();
    $('#to').html(data.to);
  }).fail(function(resp) {
    $('.error').show();
    $('.result').hide();
    $('.error').html(resp.responseText);
  });
}

$('#login').submit(function (e) {
  e.preventDefault();
  var form = $(this);
  login(form);
});

$('#call-api').click(function (e) {
  e.preventDefault();
  send_email();
});

var token = store.get('id_token');
if (token) {
  load_token(token);
} else {
  show_login();
}