<?php
// Set error reporting for debugging (remove in production)
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $jobTitle = $_POST['jobTitle'] ?? 'Job Application';
    $fullName = $_POST['fullName'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $coverLetter = $_POST['coverLetter'] ?? '';
    
    // Basic validation
    if (empty($fullName) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
        exit;
    }
    
    // Check if a file was uploaded
    if (!isset($_FILES['cv']) || $_FILES['cv']['error'] == UPLOAD_ERR_NO_FILE) {
        echo json_encode(['success' => false, 'message' => 'Please upload your CV.']);
        exit;
    }
    
    // Handle file upload
    $uploadedFile = $_FILES['cv'];
    
    // Check for upload errors
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form.',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.'
        ];
        
        $errorMessage = $errorMessages[$uploadedFile['error']] ?? 'Unknown upload error.';
        echo json_encode(['success' => false, 'message' => $errorMessage]);
        exit;
    }
    
    // Validate file type
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedType = finfo_file($fileInfo, $uploadedFile['tmp_name']);
    finfo_close($fileInfo);
    
    if (!in_array($detectedType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Please upload a PDF or Word document.']);
        exit;
    }
    
    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($uploadedFile['size'] > $maxSize) {
        echo json_encode(['success' => false, 'message' => 'File size exceeds the 5MB limit.']);
        exit;
    }
    
    // Prepare email
    
    // Set email recipient - CHANGE THIS TO YOUR EMAIL
    $to = "dinesh.nimmagadda@kampag.co.uk"; // Replace with the actual careers email address
    
    // Set email subject
    $subject = "Job Application: $jobTitle from $fullName";
    
    // Create email headers
    $headers = "From: $email" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    
    // Create a boundary for multipart/mixed
    $boundary = md5(time());
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
    
    // Prepare message body
    $message = "--$boundary\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= "Job Application for: $jobTitle\r\n\r\n";
    $message .= "Applicant Details:\r\n";
    $message .= "Name: $fullName\r\n";
    $message .= "Email: $email\r\n";
    $message .= "Phone: $phone\r\n\r\n";
    
    if (!empty($coverLetter)) {
        $message .= "Cover Letter:\r\n$coverLetter\r\n\r\n";
    }
    
    $message .= "This application was submitted from the Kampag careers page.\r\n";
    
    // Add the attachment
    $file_name = $uploadedFile['name'];
    $file_size = $uploadedFile['size'];
    $file_tmp = $uploadedFile['tmp_name'];
    
    // Read file contents
    $content = file_get_contents($file_tmp);
    $content = chunk_split(base64_encode($content));
    
    // Add file attachment
    $message .= "--$boundary\r\n";
    $message .= "Content-Type: application/octet-stream; name=\"$file_name\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-Disposition: attachment; filename=\"$file_name\"\r\n\r\n";
    $message .= $content . "\r\n";
    $message .= "--$boundary--";
    
    // Send email
    $success = mail($to, $subject, $message, $headers);
    
    // Save application to database if needed (not implemented in this example)
    
    // Send a copy to the applicant (optional)
    $applicantSubject = "Your application for $jobTitle at Kampag IT Services";
    $applicantMessage = "Dear $fullName,\r\n\r\n";
    $applicantMessage .= "Thank you for applying for the $jobTitle position at Kampag IT Services.\r\n\r\n";
    $applicantMessage .= "We have received your application and CV. Our team will review your qualifications and experience, and we will contact you if your profile matches our requirements.\r\n\r\n";
    $applicantMessage .= "If you have any questions, please feel free to contact us at dinesh.nimmagadda@kampag.co.uk.\r\n\r\n";
    $applicantMessage .= "Best regards,\r\n";
    $applicantMessage .= "Kampag IT Services Recruitment Team";
    
    $applicantHeaders = "From: dinesh.nimmagadda@kampag.co.uk\r\n";
    $applicantHeaders .= "Reply-To: dinesh.nimmagadda@kampag.co.uk\r\n";
    $applicantHeaders .= "MIME-Version: 1.0\r\n";
    $applicantHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($email, $applicantSubject, $applicantMessage, $applicantHeaders);
    
    // Return success or error message
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Your application has been submitted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'There was an error submitting your application. Please try again later.']);
    }
    exit;
}

// If accessed directly without POST data
echo json_encode(['success' => false, 'message' => 'Invalid request.']);
exit;
?>