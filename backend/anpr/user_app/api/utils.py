# import random
# import requests

# # Function to generate OTP of given length
# def generate_otp(length=6):
#     digits = "0123456789"
#     OTP = ""
#     for i in range(length):
#         OTP += digits[math.floor(random.random() * 10)]
#     return OTP

# # Function to send OTP via SMS using a third-party API
# def send_otp(phone_number, otp):
#     # Replace <YOUR_API_KEY> with your actual API key
#     url = f"https://api.example.com/send_sms?api_key=<YOUR_API_KEY>&phone={phone_number}&message=Your%20OTP%20is%20{otp}"
#     response = requests.get(url)
#     if response.status_code != 200:
#         raise Exception("Failed to send OTP")
