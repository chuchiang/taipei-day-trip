window.addEventListener("load", function () {
    let loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.style.display = "none";
});
TPDirect.setupSDK(137098, 'app_Bzm0eKHQais3yAdgkFLfescbjqLsi9Yz4QfJW03PFQiOsdrJCCT2pSjQAsIT', 'sandbox')

let fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: '後三碼'
    }
}
//css
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

//得知目前卡片資訊的輸入狀態
TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
        // alert("卡片號碼格式輸入錯誤");
        // return;
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
        // alert("日期輸入錯誤");
        // return;
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
        // alert("後三碼輸入錯誤");
        // return;
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})
//得到 TapPay Fields 卡片資訊的輸入狀態
TPDirect.card.getTappayFieldsStatus();

// TPDirect.card.getPrime 取得 Prime 回傳格式

let totalBtn = document.getElementById('total_btn');
totalBtn.addEventListener('click', function (event) {
    event.preventDefault();

    let contactName = document.getElementById('contactName').value;
    let contactEmail = document.getElementById('contactEmail').value;
    let contactPhone = document.getElementById('contactPhone').value;
    emailRule = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    cellphoneRule = /^09\d{8}$/


    if (contactName === "" || contactEmail === "" || contactPhone === "") {
        event.preventDefault(); // 阻止表單提交
        alert("請填寫完整聯絡訊息");
        return;
    } else if (!emailRule.test(contactEmail)) {
        event.preventDefault(); // 阻止表單提交
        alert("email格式輸入錯誤");
        return;
    } else if (!cellphoneRule.test(contactPhone)) {
        event.preventDefault(); // 阻止表單提交
        alert("手機格式輸入錯誤");
        return;
    }

    // 取得 TapPay Fields 的 status
    let tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('請填寫完整信用卡資訊')
        return
    }

    let namePart = "";
    let datePart = "";
    let timePart = "";
    let addressPart = "";
    let imageUrl = "";
    let confirm = [];

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        } else {        // alert('get prime 成功，prime: ' + result.card.prime)

            // send prime to your server, to pay with Pay by Prime API .

            let bookingElements = document.querySelectorAll('.booking');
            bookingElements.forEach((bookingElement, index) => {
                //name
                let name = bookingElement.querySelector('.booking_content_name').textContent.trim();
                let nameparts = name.split('：');
                namePart = nameparts[1];

                //date
                let date = bookingElement.querySelector('.booking_content_date').textContent.trim();
                let dateParts = date.split('：');
                datePart = dateParts[1];

                //time
                let time = bookingElement.querySelector('.booking_content_time').textContent.trim();
                let timeParts = time.split('：');
                let timeList = timeParts[1];

                if (timeList == "下午 1 點到下午 8 點") {
                    timePart = "afternoon";
                } else {
                    timePart = "morning";
                }
                //address
                let address = bookingElement.querySelector('.booking_content_address').textContent.trim();
                let addressParts = address.split('：');
                addressPart = addressParts[1];

                imageUrl = bookingElement.querySelector('.booking_img img').src;
                let attractionId = bookingElement.querySelector('.booking_delete').dataset.attraction;
                let price = bookingElement.querySelector('.booking_content_price').textContent.trim();
                let pricePart = price.replace(/[^0-9]/ig, "");//正則只取數字

                // 將前端資訊值轉為 JSON 格式
                let ConfirmData = {
                    "data": {
                        "prime": result.card.prime,
                        "order": {
                            "price": pricePart,
                            "trip": {
                                "attraction": {
                                    "id": attractionId,
                                    "name": namePart,
                                    "address": addressPart,
                                    "image": imageUrl
                                },
                                "date": datePart,
                                "time": timePart
                            },
                            "contact": {
                                "name": contactName,
                                "email": contactEmail,
                                "phone": contactPhone
                            }
                        }
                    }
                };
                confirm.push(ConfirmData);
                if (index === bookingElements.length - 1) {
                    // 信息處理後，再發送请求
                    let token = localStorage.getItem('jwtToken');
                    fetch('api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(confirm)
                    })

                        .then(response => {
                            return response.json();
                        })

                        .then(data => {
                            if (data.data.payment.message === "付款成功") {
                                let orderNumber = data.data.number
                                // console.log("成功");
                                // console.log(data.data);
                                window.location.href = `/thankyou?number=${orderNumber}`;
                            } else {
                                alert('付款失敗')
                            }

                        })
                        .catch(function (error) {
                            console.error('資料出錯：', error.message);
                        });

                }

            });

        }

    });


});


