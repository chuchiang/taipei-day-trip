//登入
document.addEventListener('DOMContentLoaded', function () {
    let token = localStorage.getItem('jwtToken');

    fetch("/api/user/auth", {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.data != "null") {
                LogoutButton();
            } else {
                SigninButton();
            }
        })
        .catch(function (error) {
            console.error('驗證出錯：', error.message);
        });

});

document.addEventListener('DOMContentLoaded', function () {
    let token = localStorage.getItem('jwtToken');
    let bookingBtn = document.getElementById("booking_btn");
    bookingBtn.addEventListener("click", function () {
        fetch("/api/user/auth", {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.data === "null") {
                    signin();
                } else {
                    window.location.href = '/booking';
                }
            })
            .catch(function (error) {
                console.error('驗證出錯：', error.message);
            });
    })

});

function SigninButton() {
    // 在網頁上顯示登入/註冊按鈕
    // 按鈕綁定點擊事件，示登入註冊視窗
    let manuSignInBtn = document.getElementById('menu_signin_btn');
    manuSignInBtn.textContent = '登入/註冊';
    manuSignInBtn.addEventListener('click', signin);
}

function signin() {
    //登入註冊頁面跳轉

    let manuSignInBtn = document.querySelector('#menu_signin_btn');
    let signInBox = document.getElementById('signinBox');
    let signInClose = document.querySelector('#signin_close');
    let signInToSignUP = document.querySelector('#signInToSignUP');
    let signUpBox = document.querySelector('#signUpBox');
    let signUpClose = document.querySelector('#signup_close');
    let signUpToSignin = document.querySelector('#signUpToSignin');

    signInBox.style.display = 'block';
    overlay.style.display = 'block';

    signInClose.addEventListener('click', function () {
        signInBox.style.display = 'none';
        overlay.style.display = 'none';
        // 清空登入輸入框的值
        document.getElementById('signInMessage').textContent = ""
        document.getElementById('signInEmail').value = '';
        document.getElementById('signinPassword').value = '';

    })
    manuSignInBtn.addEventListener('click', function () {
        signInBox.style.display = 'block';
        overlay.style.display = 'block';
    })
    signInToSignUP.addEventListener('click', function () {
        signUpBox.style.display = 'block'
        signInBox.style.display = 'none';
        // 清空登入輸入框的值
        document.getElementById('signInMessage').textContent = ""
        document.getElementById('signInEmail').value = '';
        document.getElementById('signinPassword').value = '';
    })
    signUpClose.addEventListener('click', function () {
        signUpBox.style.display = 'none';
        overlay.style.display = 'none';
        // 清空登入輸入框的值
        document.getElementById('signUpMessage').textContent = "";
        document.getElementById('signUpName').value = '';
        document.getElementById('signUpEmail').value = '';
        document.getElementById('signUpPassword').value = '';

    })
    signUpToSignin.addEventListener("click", function () {
        signUpBox.style.display = 'none';
        signInBox.style.display = 'block';
        // 清空登入輸入框的值
        document.getElementById('signUpMessage').textContent = "";
        document.getElementById('signUpName').value = '';
        document.getElementById('signUpEmail').value = '';
        document.getElementById('signUpPassword').value = '';
    })

    //登入資料提交給後端
    let signInBtn = document.getElementById('signInBtn');

    signInBtn.addEventListener('click', function (event) {
        event.preventDefault(); // 防止表單提交刷新頁面
        let signInEmail = document.getElementById('signInEmail').value;
        let signinPassword = document.getElementById('signinPassword').value;
        let signInMessage = document.getElementById('signInMessage');
        emailRule = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;


        if (signInEmail === "" || signinPassword === "") {
            event.preventDefault(); // 阻止表單提交
            signInMessage.textContent = "請輸入完整登入資訊";
            return;
        } else if (!emailRule.test(signInEmail)) {
            event.preventDefault(); // 阻止表單提交
            signInMessage.textContent = "email格式輸入錯誤";
            return;
        }

        // 將用戶輸入的值轉為 JSON 格式
        let signInData = {
            email: signInEmail,
            password: signinPassword
        };
        // 將 JSON 格式的資料發送到後端
        fetch('/api/user/auth', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signInData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                    signInMessage.textContent = "登入成功"
                    console.log("登入成功");
                    location.reload();
                } else {
                    signInMessage.textContent = "email或密碼錯誤"
                    console.log("登入失敗");
                }
            })
            .catch(error => console.error('Error', error));

    });

    //註冊資料
    let signUpBtn = document.getElementById('signUpBtn');

    signUpBtn.addEventListener('click', function (event) {
        event.preventDefault(); // 防止表單提交刷新頁面
        let signUpName = document.getElementById('signUpName').value;
        let signUpEmail = document.getElementById('signUpEmail').value;
        let signUpPassword = document.getElementById('signUpPassword').value;
        let signUpMessage = document.getElementById('signUpMessage');
        emailRule = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if (signUpName === "" || signUpEmail === "" || signUpPassword === "") {
            event.preventDefault(); // 阻止表單提交
            signUpMessage.textContent = "請輸入完整註冊資訊";
            return;
        } else if (!emailRule.test(signUpEmail)) {
            event.preventDefault(); // 阻止表單提交
            signUpMessage.textContent = "email格式輸入錯誤";
            return;
        }

        // 將用戶輸入的值轉為 JSON 格式
        signUpData = {
            name: signUpName,
            email: signUpEmail,
            password: signUpPassword
        }
        // 將 JSON 格式的資料發送到後端
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signUpData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {//是否存在OK屬性
                    signUpMessage.textContent = "註冊成功"
                    console.log("註冊成功");
                } else {
                    signUpMessage.textContent = "email已經註冊過"
                    console.log("註冊失敗");
                }

            })
            .catch(error => console.error('Error', error));
    });
}

function LogoutButton() {
    // 在網頁上顯示登出按鈕
    // 並為按鈕綁定點擊事件，以執行登出程序
    let manuSignInBtn = document.getElementById('menu_signin_btn');
    manuSignInBtn.textContent = '登出系統';
    manuSignInBtn.addEventListener('click', logout);
}

function logout() {
    // 清空 Local Storage 中的 Token 資訊
    localStorage.removeItem('jwtToken');
    // 重新載入相同頁面
    location.reload();
}