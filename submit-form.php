<?php
// Set error reporting for debugging (remove in production)
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    $privacyConsent = isset($_POST['privacy']);
    
    // Initialize response array
    $response = ['success' => false, 'message' => ''];
    
    // Basic validation
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        $response['message'] = 'Please fill in all required fields.';
        echo json_encode($response);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
        echo json_encode($response);
        exit;
    }
    
    // Check privacy consent
    if (!$privacyConsent) {
        $response['message'] = 'You must agree to our privacy policy.';
        echo json_encode($response);
        exit;
    }
    
    // Sanitize inputs for email
    $name = htmlspecialchars($name);
    $email = htmlspecialchars($email);
    $subject = htmlspecialchars($subject);
    $message = htmlspecialchars($message);
    
    // Prepare email
    
    // Set email recipient - CHANGE THIS TO YOUR EMAIL
    $to = "info@kampag.co.uk"; // The email address where you want to receive contact messages
    
    // Set email subject with a prefix to identify source
    $emailSubject = "Contact Form: $subject";
    
    // Prepare email body
    $emailBody = "Name: $name\r\n";
    $emailBody .= "Email: $email\r\n";
    $emailBody .= "Subject: $subject\r\n\r\n";
    $emailBody .= "Message:\r\n$message\r\n\r\n";
    $emailBody .= "This message was submitted from the Kampag contact form.\r\n";
    
    // Set email headers
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Send email
    $success = mail($to, $emailSubject, $emailBody, $headers);
    
    // Optional: Send a copy to the sender
    if ($success) {
        $senderSubject = "Your message to Kampag IT Services";
        $senderMessage = "Dear $name,\r\n\r\n";
        $senderMessage .= "Thank you for contacting Kampag IT Services. We have received your message and will get back to you shortly.\r\n\r\n";
        $senderMessage .= "Here's a copy of your message:\r\n\r\n";
        $senderMessage .= "Subject: $subject\r\n";
        $senderMessage .= "Message:\r\n$message\r\n\r\n";
        $senderMessage .= "Best regards,\r\n";
        $senderMessage .= "Kampag IT Services Team";
        
        $senderHeaders = "From: info@kampag.co.uk\r\n";
        $senderHeaders .= "Reply-To: info@kampag.co.uk\r\n";
        $senderHeaders .= "X-Mailer: PHP/" . phpversion();
        
        mail($email, $senderSubject, $senderMessage, $senderHeaders);
    }
    
    // Optional: Log contacts in a database
    
    // Return response
    if ($success) {
        $response['success'] = true;
        $response['message'] = 'Your message has been sent successfully. We will get back to you soon.';
    } else {
        $response['message'] = 'There was an error sending your message. Please try again later.';
    }
    
    echo json_encode($response);
    exit;
}

// If accessed directly without POST data
echo json_encode(['success' => false, 'message' => 'Invalid request.']);
exit;
?>