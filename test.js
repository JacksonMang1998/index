//
// This js gets loaded into the swagger UI and will make 
// adjustments to support oauth2 pwd login flow and 
// any other customizations we need
//

// re-label the "Explore" button to "Login"
$('#explore').each(function () {
    $(this).text("Login");
});

$('#message-bar').each(function () {
    $(this).append('<p id="login-msg" style="color:red" >You have not logged in</p>')
});

// seed the user:pwd field for now as a demo (admin:admin is just a default)
$('#input_apiKey').each(function () {
    $(this).val("admin:admin");
});

// hook the click on Login to get a token using the oauth2 password grant
$('#explore').click(function () {
    var key = $('#input_apiKey')[0].value;
    console.log("api key changed to -> " + key);
    var credentials = key.split(':'); //username:password expected
    if (credentials.length != 2) {
        alert("Your credentials must be of the form : userid:password");
    }
    var theUsername = encodeURIComponent(credentials[0]);
    var thePw = encodeURIComponent(credentials[1]);
    $.ajax({
        url: "/api/v1/token",
        type: "post",
        contenttype: 'x-www-form-urlencoded',
        data: "grant_type=password&username=" + theUsername + "&password=" + thePw,
        success: function (response) {
            console.log("login success, token is : " + response.access_token);
            var bearerToken = 'Bearer ' + response.access_token;
            // swagger uo support for pwd auth is elusive and not working yet
            // but we set the token the proper place anyway 
            window.swaggerUi.api.clientAuthorizations.add(
                'key',
                new SwaggerClient.ApiKeyAuthorization(
                    'Authorization',
                    bearerToken,
                    'header'));
            // we set this header explicitly on all auth input parameters
            // as a workaround for swagger ui pwd auth not working 
            $("input[name='Authorization']").each(function () {
                $(this).val(bearerToken);
            });
            $('#login-msg').each(function () {
                $(this).text('login was successful, you have a token now!')
                $(this).css('color','green')
            });
        },
        error: function (xhr, ajaxoptions, thrownerror) {
            alert("Login failed!");
        }
    });
    // necessary to prevent full page reloads on href="#"
    return false;
});

