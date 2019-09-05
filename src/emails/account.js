const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"chachadyash786@gmail.com",
        subject:"Welcome to the Task Manager App! Let's get Started",
        text:`Hey ${name} , Let Us know what you expect!`,
        //html:"<h1>Hurrah</h1>"
    })
}

sendDeleteEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"chachadyash786@gmail.com",
        subject:"Account Deleted Successfully",
        text:`With a heart we abide you a goodbye ,Is there anything else we could have done to keep you on board ? Until then, Bye bye ${name}`
    })

}
module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}
