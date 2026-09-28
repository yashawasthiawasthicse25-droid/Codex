const nodemailer = require("nodemailer");

const notificationLog = [];

async function sendEmail(notification) {
    if (!notification.email || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("[approval-notification] Email skipped: SMTP_USER or SMTP_PASS is not configured.");
        return false;
    }
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: notification.email, subject: "Approval status changed", text: notification.message });
    return true;
}

async function sendSms(notification) {
    if (!notification.phone || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM) {
        console.log("[approval-notification] SMS skipped: Twilio settings are not configured.");
        return false;
    }
    const body = new URLSearchParams({ To: notification.phone, From: process.env.TWILIO_FROM, Body: notification.message });
    const credentials = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!response.ok) throw new Error(`Twilio returned ${response.status}.`);
    return true;
}

async function notifyStatusChange({ application, previousStatus, newStatus }) {
    const message = `${application.approvalName} (${application.applicationId}) changed from ${previousStatus} to ${newStatus}.`;
    const notification = {
        id: `NOTIFY_${Date.now()}`,
        applicationId: application.applicationId,
        email: application.contact?.email || null,
        phone: application.contact?.phone || null,
        message,
        channels: [],
        delivered: false,
        createdAt: new Date()
    };

    if (notification.email) notification.channels.push("email");
    if (notification.phone) notification.channels.push("phone");

    try { if (await sendEmail(notification)) notification.delivered = true; } catch (error) { notification.emailError = error.message; }
    try { if (await sendSms(notification)) notification.delivered = true; } catch (error) { notification.smsError = error.message; }
    notificationLog.push(notification);
    console.log(`[approval-notification] ${message} -> ${notification.channels.join(", ") || "no contact"}`);
    return notification;
}

function getNotificationLog() {
    return notificationLog.slice().reverse();
}

module.exports = { notifyStatusChange, getNotificationLog };