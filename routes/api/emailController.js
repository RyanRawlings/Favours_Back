const nodemailer = require('nodemailer');

/*******************************************************
 * Send welcome email -> Currently unused by the
 * application, could not connect it the services
 * 
 * @desc send email to the user email 
 * @param user email
 * @return void
 *******************************************************/
exports.welcomeEmail = async function(user) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "ryan.rawlings96@gmail.com",
        pass: "hsnfbuldnjkeynsm"
      }
    });
    
    const mailOptions = {
      from: 'favours@uts.com.au',
      to: user.email,
      subject: 'Welcome to Favours',
      text: `<html lang="en">
                <head>
                    <meta charset="utf-8">      
                    <title>Your Favours Account</title>              
                </head>
                
                <body>
                <p>Hi ${user.firstname},</p>
                <p>Welcome to Favours</p>
                <table>
                    <tr>
                        <th>Detail</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Registered Email</td>
                        <td>${user.email}</td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td>${user.password}</td>
                    </tr>
                </table>
                <p>It is strongly advised that you manage your password in a secure way to ensure account safety</p>
                <p>Thank you,</p>
                <p>Favours Team</p>
                    <script src="js/scripts.js"></script>
                </body>
                </html>
                `
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}
