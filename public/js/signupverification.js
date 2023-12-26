
//  client side form validation

const form = document.getElementById('form');

form.addEventListener('submit', (e) => {
    if (!validateInputs()) {
        e.preventDefault(); 
    }

});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.remove('error');
    inputControl.classList.add('success');
};

const isValidEmail = (email) => {
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(email);
};

const validateInputs = () => {
    const username = document.getElementById('username');
    const phone_number = document.getElementById('phone_number')
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPass = document.getElementById('confirmPass')
    
    const usernameValue = username.value.trim();
    const phonenumberValue = phone_number.value.trim()
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmpassValue = confirmPass.value.trim();
    
    let hasErrors = false; // Flag to track if there are validation errors

    if (usernameValue === '') {
        setError(username, 'Username is required');
        hasErrors = true;
    } else {
        setSuccess(username);
    }
    if(phonenumberValue === ''){
        setError(phone_number,'phone number is required')
        hasErrors= true;
    } else {
        setSuccess(phone_number);
    }
    
    if (emailValue === '') {
        setError(email, 'Email is required');
        hasErrors = true;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Enter a valid email address');
        hasErrors = true;
    } else {
        setSuccess(email);
    }
    
    if (passwordValue === '') {
        setError(password, 'Password is required');
        hasErrors = true;
    }
    if(confirmpassValue === ''){
        setError(confirmPass,'confirm your password')
        hasErrors = true;
    }
    else if(passwordValue !== confirmpassValue){
        setError(password,'Password error')
        hasErrors = true;
    }
     else {
        setSuccess(password);
    }

    return !hasErrors; 
};



