var nodemailer = require('nodemailer');

function sendMail(rec, username, password) {

  return new Promise((resolve, reject) => {
    var smtpTransport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "nknowweather@gmail.com",
        pass: "Niti@219"
      }
    });

    var mailOptions = {
      to: rec,
      subject: 'Retrieve your Credentials',
      text: `Dear ${username},

      Your credentials has been successfully retrieved. Your credentials are
      UserName: ${username}
      Password:  ${password}


      please click on below url go to KnowWeather

      ${'https://nknowweather.herokuapp.com/'}
     `
    }

    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        reject(error);
      } else {
        resolve('Message Sent')
      }
    });
  })

}

module.exports.sendMail = sendMail;