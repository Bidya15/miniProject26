package com.backend.backend.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email:noreply@alumniportal.com}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String otp) {
        String subject = "Alumni Connect - Email Verification OTP";
        String body = "Greetings,\n\n" +
                "Your OTP for email verification is: " + otp + "\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Regards,\n" +
                "Alumni Connect Team";

        logToConsole(to, subject, "Verification OTP: " + otp);
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String otp) {
        String subject = "Alumni Connect - Password Reset OTP";
        String body = "Greetings,\n\n" +
                "You have requested to reset your password. Your OTP for password reset is: " + otp + "\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Regards,\n" +
                "Alumni Connect Team";

        logToConsole(to, subject, "Password Reset OTP: " + otp);
        sendEmail(to, subject, body);
    }

    public void sendApprovalNotification(String to, String registrantName, String registrantRole) {
        String subject = "Alumni Connect - Account Approval Required";
        String body = "Hello,\n\n" +
                "A new " + registrantRole + " account has been created and requires your approval.\n\n" +
                "Registrant Name: " + registrantName + "\n\n" +
                "Regards,\n" +
                "Alumni Connect System";

        logToConsole(to, subject, "New Admin/Alumni Approval Needed!");
        sendEmail(to, subject, body);
    }

    public void sendBulkEmail(java.util.List<String> bccRecipients, String subject, String body) {
        logToConsole("BCC: " + String.join(", ", bccRecipients), subject, body);
        for (String to : bccRecipients) {
            sendEmail(to, subject, body);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        if (sendGridApiKey == null || sendGridApiKey.trim().isEmpty() || sendGridApiKey.contains("YOUR_SENDGRID_API_KEY")) {
            System.out.println(">>> SKIP SENDGRID: No valid API Key found. Using terminal only.");
            return;
        }

        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println(">>> SendGrid Status: " + response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                System.out.println(">>> SendGrid Error Detail: " + response.getBody());
            }
        } catch (IOException ex) {
            System.err.println(">>> SendGrid Error: " + ex.getMessage());
        }
    }

    private void logToConsole(String to, String subject, String body) {
        System.out.println("\n--- [REAL-TIME EMAIL SIMULATOR] ---");
        System.out.println("TO:      " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("CONTENT: " + body);
        System.out.println("----------------------------------\n");
    }
}
