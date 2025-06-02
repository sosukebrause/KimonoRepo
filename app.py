import os
from flask import Flask, render_template, request, flash, redirect, url_for
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')
        
        try:
            msg = Message(
                subject=f"Contact Form: {subject}",
                recipients=[app.config['MAIL_DEFAULT_SENDER']],
                body=f"From: {name} <{email}>\n\n{message}"
            )
            mail.send(msg)
            flash('Your message has been sent successfully!', 'success')
        except Exception as e:
            flash('An error occurred while sending your message. Please try again later.', 'error')
            print(f"Error sending email: {str(e)}")
        
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/subscribe', methods=['POST'])
def subscribe():
    email = request.form.get('subscribe_email')
    
    try:
        # Here you would typically add the email to your newsletter database
        # For this example, we'll just send a confirmation email
        msg = Message(
            subject="Newsletter Subscription Confirmation",
            recipients=[email],
            body="Thank you for subscribing to our newsletter! We'll keep you updated with our latest news and updates."
        )
        mail.send(msg)
        flash('Thank you for subscribing to our newsletter!', 'success')
    except Exception as e:
        flash('An error occurred while processing your subscription. Please try again later.', 'error')
        print(f"Error processing subscription: {str(e)}")
    
    return redirect(url_for('contact'))

if __name__ == '__main__':
    app.run(debug=True) 