function sendmail() {
    var message = document.getElementById("message").value;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;

    if (name === "" || email === "") {
        alert("Name and email are required!");
        return;
    }

    var templateParams = {
        from_name: name,
        message: message,
        reply_to: email
    };


    var sendButton = document.getElementById("sendLetter");
    sendButton.textContent = "Sending...";
    sendButton.disabled = true;


    emailjs.send('service_zsci4of', 'template_t5wnh4c', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert("Message sent successfully!");


            document.getElementById("message").value = "";
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";


            sendButton.textContent = "Send";
            sendButton.disabled = false;
        }, function(error) {
            console.log('FAILED...', error);
            alert("Message failed to send!");


            sendButton.textContent = "Send";
            sendButton.disabled = false;
        });
}