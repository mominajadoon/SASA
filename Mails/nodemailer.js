const nodemailer = require("nodemailer");
const User = require("../Models/user");

const sendEmailOtp = async (email) => {
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  await User.findOneAndUpdate(
    { email },
    { $set: { otp: generatedOtp } },
    { new: true }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const options = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Email Verification Request",
      html: generateOtpEmailHtml(generatedOtp),
    };

    await transporter.sendMail(options);
  } catch (error) {
    console.error(error);
  }
};

const generateOtpEmailHtml = (otp) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
    <style>
      body {
        background-color: #f6f9fc;
        padding: 10px 0;
      }
      .container {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        padding: 45px;
      }
      .text {
        font-size: 16px;
        font-family: 'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light',
          'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
        font-weight: 300;
        color: #404040;
        line-height: 26px;
      }
      .otp {
        background-color: #007ee6;
        border-radius: 4px;
        color: #fff;
        font-family: 'Open Sans', 'Helvetica Neue', Arial;
        font-size: 18px;
        text-decoration: none;
        text-align: center;
        display: block;
        width: 100%;
        padding: 14px 7px;
      }
      .anchor {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://react-email-demo-dr9excyry-resend.vercel.app/static/dropbox-logo.png"
        width="40"
        height="33"
        alt="Dropbox"
      />
      <div>
        <p class="text">Hi,</p>
        <p class="text">
          To complete your registration, please verify your email address by
          following the steps below:
        </p>
        <p class="otp">${otp}</p>
        <p class="text">
          To keep your account secure, please don't forward this email to
          anyone.
        </p>
        <!--
        <p class="text">
          This verification email token is valid for 5 minutes. If needed,
          you can always
          <a class="anchor" href="http://localhost:3000/auth/reset">
            generate a new token
          </a>.
        </p>
        -->
      </div>
    </div>
  </body>
</html>
`;

module.exports = sendEmailOtp;
